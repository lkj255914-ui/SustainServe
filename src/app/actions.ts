'use server';

import {
  optimizeCollectionRoutes,
  OptimizeCollectionRoutesInput,
  OptimizeCollectionRoutesOutput,
} from '@/ai/flows/optimize-collection-routes';
import { z } from 'zod';
import { WasteApplication } from './lib/data';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const formSchema = z.object({
  department: z.string().min(2, 'Department is required.'),
  address: z.string().min(5, 'Address is required.'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  wasteType: z.string().min(2, 'Waste type is required.'),
  quantity: z.string().min(1, 'Quantity is required.'),
  photoDataUri: z.string().optional(),
  details: z.string().optional(),
});

export async function submitWasteApplicationAction(
  values: z.infer<typeof formSchema>
): Promise<ActionResult<{ applicationId: string }>> {
  const validation = formSchema.safeParse(values);
  if (!validation.success) {
    return { success: false, error: 'Invalid form data.' };
  }

  try {
    // In a real app, you would save this to a database.
    console.log('New application submitted:', validation.data);
    const applicationId = `APP-${Math.floor(Math.random() * 900) + 100}`;
    return { success: true, data: { applicationId } };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message || 'Failed to submit application.' };
  }
}

export async function runRouteOptimizationAction(
  applications: WasteApplication[]
): Promise<ActionResult<OptimizeCollectionRoutesOutput>> {
    if(!applications || applications.length === 0) {
        return { success: false, error: 'No pending applications to optimize.' };
    }

  const input: OptimizeCollectionRoutesInput = {
    wasteApplications: applications.map(app => ({
        applicationId: app.applicationId,
        address: app.address,
        latitude: app.latitude,
        longitude: app.longitude,
        wasteType: app.wasteType,
        quantity: app.quantity,
        department: app.department,
        submissionDate: app.submissionDate,
    })),
    vehicleCapacity: 1000, // Example capacity in kg
    depotLocation: {
      latitude: 39.8020,
      longitude: -89.6437,
    },
  };

  try {
    const output = await optimizeCollectionRoutes(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message || 'An unknown error occurred during optimization.' };
  }
}
