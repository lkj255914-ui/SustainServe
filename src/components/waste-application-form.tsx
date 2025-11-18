'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useState, useTransition } from 'react';
import { Camera, Loader2, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import ExifReader from 'exifreader';

const formSchema = z.object({
  departmentId: z.string().min(2, 'Department is required.'),
  address: z.string().min(5, 'Address is required.'),
  locationLatitude: z.number().optional(),
  locationLongitude: z.number().optional(),
  photoLatitude: z.number().optional(),
  photoLongitude: z.number().optional(),
  wasteType: z.string().min(2, 'Waste type is required.'),
  quantity: z.string().min(1, 'Quantity is required.'),
  photoDataUri: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function WasteApplicationForm() {
  const [isPending, startTransition] = useTransition();
  const [isLocating, setIsLocating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      departmentId: '',
      address: '',
      wasteType: '',
      quantity: '',
      notes: '',
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        
        try {
            const tags = await ExifReader.load(file);
            const latitude = tags?.GPSLatitude?.description;
            const longitude = tags?.GPSLongitude?.description;

            if(latitude && longitude) {
                form.setValue('photoLatitude', Number(latitude), { shouldValidate: true });
                form.setValue('photoLongitude', Number(longitude), { shouldValidate: true });
                 toast({
                    title: 'Photo Location Found',
                    description: 'GPS coordinates were extracted from the photo metadata.',
                });
            } else {
                 toast({
                    title: 'No GPS Data',
                    description: 'Could not find GPS coordinates in the photo metadata.',
                });
            }
        } catch (e) {
            console.warn("Could not read EXIF data from photo.", e)
             toast({
                variant: 'destructive',
                title: 'Metadata Error',
                description: 'Could not read metadata from the uploaded photo.',
            });
        }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      try {
        toast({
          title: 'Compressing Image...',
          description: 'Please wait while we optimize your photo.',
        });
        const compressedFile = await imageCompression(file, options);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUri = reader.result as string;
            setPhotoPreview(dataUri);
            form.setValue('photoDataUri', dataUri);
             toast({
              title: 'Image Ready!',
              description: 'Your photo has been compressed and is ready for upload.',
            });
        };
        reader.readAsDataURL(compressedFile);

      } catch (error) {
        console.error('Image compression error:', error);
        toast({
          variant: 'destructive',
          title: 'Compression Failed',
          description: 'Could not compress the image. Please try another one.',
        });
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUri = reader.result as string;
            setPhotoPreview(dataUri);
            form.setValue('photoDataUri', dataUri);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue('locationLatitude', position.coords.latitude);
          form.setValue('locationLongitude', position.coords.longitude);
          toast({
            title: 'Location Acquired',
            description: 'Your current device location has been set.',
          });
          setIsLocating(false);
        },
        (error) => {
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: error.message,
          });
          setIsLocating(false);
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
      });
    }
  };

  const handleShowPhotoLocation = () => {
    const lat = form.getValues('photoLatitude');
    const lng = form.getValues('photoLongitude');
    if (lat && lng) {
      toast({
        title: 'Photo GPS Coordinates',
        description: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'No GPS Data Available',
        description: 'GPS coordinates were not found in the photo metadata.',
      });
    }
  };

 async function onSubmit(values: FormValues) {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to submit an application.',
      });
      return;
    }

    startTransition(async () => {
      try {
        let photoUrl = '';
        if (values.photoDataUri) {
          toast({
            title: 'Uploading Photo...',
            description: 'Please wait, your photo is being uploaded.',
          });
          const storage = getStorage();
          const storageRef = ref(storage, `waste-photos/${user.uid}/${Date.now()}`);
          
          // Non-blocking upload
          uploadString(storageRef, values.photoDataUri, 'data_url').then(snapshot => {
            getDownloadURL(snapshot.ref).then(url => {
              // Note: This happens in the background. The user has already seen the success message.
              // We could potentially update the document with the URL later if needed,
              // but for now, we'll send it with the initial data.
              // To do that, we'd need to change the logic slightly.
            });
          });
        }
        
        const applicationsCollection = collection(firestore, 'wasteApplications');

        // To make the UI feel instant, we'll get the download URL first.
        // For a true "fire-and-forget", we would save the doc and update the URL later.
        // Let's stick to the slightly slower but more robust method.
        if (values.photoDataUri) {
          const storage = getStorage();
          const storageRef = ref(storage, `waste-photos/${user.uid}/${Date.now()}`);
          const snapshot = await uploadString(storageRef, values.photoDataUri, 'data_url');
          photoUrl = await getDownloadURL(snapshot.ref);
        }


        const applicationData = {
          ...values,
          photoUrl: photoUrl,
          quantity: parseFloat(values.quantity) || 0,
          userId: user.uid,
          userEmail: user.email,
          status: 'submitted' as const,
          submissionDate: new Date().toISOString(),
        };
        delete (applicationData as any).photoDataUri;
        delete (applicationData as any).id; // Ensure no client-side id is sent
        
        const docRef = await addDocumentNonBlocking(applicationsCollection, applicationData);
        
        toast({
          title: 'Application Submitted',
          description: 'Your waste application has been received.',
        });
        
        form.reset();
        setPhotoPreview(null);
      } catch (error: any) {
        console.error('Submission Error:', error);
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    });
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">New Waste Application</CardTitle>
        <CardDescription>
          Fill out the form to request waste collection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Facilities" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, City" {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide the full address of the waste location.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Live Geolocation</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Latitude"
                      {...form.register('locationLatitude')}
                      disabled
                    />
                    <Input
                      placeholder="Longitude"
                      {...form.register('locationLongitude')}
                      disabled
                    />
                    <Button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      variant="outline"
                    >
                      {isLocating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormDescription>
                    Click the pin to get your current location from the browser.
                  </FormDescription>
                </FormItem>
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="photoDataUri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Photo</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <div className="relative h-24 w-24 rounded-md border flex items-center justify-center bg-muted/50">
                            {photoPreview ? (
                              <Image
                                src={photoPreview}
                                alt="Waste preview"
                                fill
                                objectFit="cover"
                                className="rounded-md"
                              />
                            ) : (
                              <Camera className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button type="button" asChild variant="outline">
                              <label
                                htmlFor="photo-upload"
                                className="cursor-pointer"
                              >
                                Upload Photo
                              </label>
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleShowPhotoLocation} disabled={!photoPreview}>
                                Show Photo Location
                            </Button>
                           </div>
                          <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      </FormControl>
                       <FormDescription>
                        GPS data is extracted automatically from photo metadata, if available.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="wasteType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a waste type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Recyclable">Recyclable</SelectItem>
                          <SelectItem value="General Waste">
                            General Waste
                          </SelectItem>
                          <SelectItem value="Organic">Organic</SelectItem>
                          <SelectItem value="Hazardous">Hazardous</SelectItem>
                          <SelectItem value="E-Waste">E-Waste</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any specific instructions or details about the waste."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending || !user}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
             {!user && <p className="text-sm text-muted-foreground">You must be logged in to submit an application.</p>}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
