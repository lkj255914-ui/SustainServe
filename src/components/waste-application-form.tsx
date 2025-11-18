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
import { collection, doc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

const formSchema = z.object({
  departmentId: z.string().min(2, 'Department is required.'),
  address: z.string().min(5, 'Address is required.'),
  locationLatitude: z.number().optional(),
  locationLongitude: z.number().optional(),
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
        
      const options = {
        maxSizeMB: 1, // (default: 1)
        maxWidthOrHeight: 1920, // (default: 1920)
        useWebWorker: true, // (default: true)
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
        // Fallback to original file if compression fails
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
            description: 'Latitude and Longitude have been set.',
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
        const newDocId = doc(collection(firestore, 'wasteApplications')).id;

        if (values.photoDataUri) {
          const storage = getStorage();
          const storageRef = ref(storage, `waste-photos/${user.uid}/${newDocId}`);
          
          toast({
            title: 'Uploading Photo...',
            description: 'This may take a moment depending on your connection.',
          });

          const snapshot = await uploadString(storageRef, values.photoDataUri, 'data_url');
          photoUrl = await getDownloadURL(snapshot.ref);
        }

        const applicationData = {
          ...values,
          id: newDocId,
          photoUrl: photoUrl,
          quantity: parseFloat(values.quantity) || 0,
          userId: user.uid,
          userEmail: user.email,
          status: 'submitted' as const,
          submissionDate: new Date().toISOString(),
        };
        delete (applicationData as any).photoDataUri;

        const applicationsCollection = collection(firestore, 'wasteApplications');
        const newDocRef = doc(applicationsCollection, newDocId);
        
        await addDocumentNonBlocking(applicationsCollection, applicationData);

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
                        Start typing to get address suggestions (feature coming
                        soon).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Geolocation</FormLabel>
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
                    >
                      {isLocating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormDescription>
                    Click the pin to automatically get your current location.
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
                          <Button type="button" asChild variant="outline">
                            <label
                              htmlFor="photo-upload"
                              className="cursor-pointer"
                            >
                              Upload Photo
                            </label>
                          </Button>
                          <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      </FormControl>
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
