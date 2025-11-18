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
import {
  Camera,
  CheckCircle,
  Loader2,
  MapPin,
  Sparkles,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import ExifReader from 'exifreader';
import { runWasteVerificationAction } from '@/app/actions';
import type { VerifyWasteImageOutput } from '@/ai/flows/verify-waste-image';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

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
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const [isVerificationPending, startVerificationTransition] = useTransition();
  const [isLocating, setIsLocating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerifyWasteImageOutput | null>(null);
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

  const watchPhoto = form.watch('photoDataUri');
  const watchWasteType = form.watch('wasteType');

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setVerificationResult(null); // Reset verification on new photo
      try {
        const tags = await ExifReader.load(file);
        const latitude = tags?.GPSLatitude?.description;
        const longitude = tags?.GPSLongitude?.description;
        if (latitude && longitude) {
            form.setValue('photoLatitude', latitude as number);
            form.setValue('photoLongitude', longitude as number);
            toast({
                title: 'Photo Location Found',
                description: 'GPS coordinates were extracted from the photo metadata.',
            });
        } else {
            toast({
                title: 'Photo Location Not Found',
                description: 'No GPS coordinates were found in the photo metadata.',
                variant: 'destructive',
            });
        }
      } catch (e) {
        console.warn('Could not read EXIF data from photo.', e);
         toast({
            title: 'Metadata Error',
            description: 'Could not read location data from the photo.',
            variant: 'destructive',
        });
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPhotoPreview(dataUri);
        form.setValue('photoDataUri', dataUri);
      };
      reader.readAsDataURL(file);
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

  const handleWasteVerification = () => {
    const photoDataUri = form.getValues('photoDataUri');
    const wasteType = form.getValues('wasteType');

    if (!photoDataUri || !wasteType) {
      toast({
        title: 'Missing Information',
        description:
          'Please select a waste type and upload a photo before verifying.',
        variant: 'destructive',
      });
      return;
    }

    startVerificationTransition(async () => {
      setVerificationResult(null);
      const result = await runWasteVerificationAction({
        photoDataUri,
        wasteType,
      });
      if (result.success) {
        setVerificationResult(result.data);
      } else {
        toast({
          title: 'Verification Failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
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
     if (!verificationResult || !verificationResult.isMatch) {
      toast({
        variant: 'destructive',
        title: 'Submission Blocked',
        description: 'Please run and pass AI verification before submitting.',
      });
      return;
    }

    startSubmitTransition(() => {
      toast({
        title: 'Submitting Application...',
        description:
          'Your application is being processed in the background.',
      });

      // Fire-and-forget the async operations
      (async () => {
        try {
          let photoUrl = '';
          if (values.photoDataUri) {
            const storage = getStorage();
            const storageRef = ref(
              storage,
              `waste-photos/${user.uid}/${Date.now()}`
            );
            const snapshot = await uploadString(
              storageRef,
              values.photoDataUri,
              'data_url'
            );
            photoUrl = await getDownloadURL(snapshot.ref);
          }

          const applicationsCollection = collection(
            firestore,
            'wasteApplications'
          );
          const applicationData = {
            ...values,
            photoUrl: photoUrl,
            quantity: parseFloat(values.quantity) || 0,
            userId: user.uid,
            userEmail: user.email,
            status: 'submitted' as const,
            submissionDate: new Date().toISOString(),
            isVerified: verificationResult.isMatch,
            verificationNotes: verificationResult.reason,
          };
          delete (applicationData as any).photoDataUri;

          await addDocumentNonBlocking(applicationsCollection, applicationData);

          // This toast will appear in the UI, but it's not awaited
          toast({
            title: 'Application Submitted Successfully',
            description: 'We have received your application.',
          });
        } catch (error: any) {
          console.error('Background Submission Error:', error);
          toast({
            variant: 'destructive',
            title: 'Background Submission Failed',
            description:
              'There was an issue saving your application. Please try again.',
          });
        }
      })();

      // Reset form immediately
      form.reset();
      setPhotoPreview(null);
      setVerificationResult(null);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">New Waste Application</CardTitle>
        <CardDescription>
          Fill out the form to request waste collection. Use the AI
          verification tool to ensure accuracy.
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
                    Click the pin to get your current location from the
                    browser.
                  </FormDescription>
                </FormItem>
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="wasteType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setVerificationResult(null); // Reset on change
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a waste type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Recyclable">
                            Recyclable
                          </SelectItem>
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
                  name="photoDataUri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste Photo</FormLabel>
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
                        <div className="flex-1 space-y-2">
                          <Button
                            type="button"
                            asChild
                            variant="outline"
                            className="w-full"
                          >
                            <label
                              htmlFor="photo-upload"
                              className="cursor-pointer"
                            >
                              Upload Photo
                            </label>
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
                      <FormDescription>
                        GPS data is extracted automatically from photo
                        metadata, if available.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleWasteVerification}
                    disabled={
                      isVerificationPending || !watchPhoto || !watchWasteType
                    }
                  >
                    {isVerificationPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Verify with AI
                  </Button>
                  {verificationResult && (
                    <Alert
                      variant={
                        verificationResult.isMatch ? 'default' : 'destructive'
                      }
                    >
                      {verificationResult.isMatch ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {verificationResult.isMatch
                          ? 'Match Confirmed'
                          : 'Potential Mismatch'}
                      </AlertTitle>
                      <AlertDescription>
                        {verificationResult.reason}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 10"
                          {...field}
                        />
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

            <Button type="submit" disabled={isSubmitPending || !user || !verificationResult?.isMatch}>
              {isSubmitPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Application
            </Button>
            {!user && (
              <p className="text-sm text-muted-foreground">
                You must be logged in to submit an application.
              </p>
            )}
             {user && !verificationResult?.isMatch && (
              <p className="text-sm text-muted-foreground">
                Please ensure AI verification is successful before submitting.
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
