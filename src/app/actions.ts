'use server';

import {
  optimizeCollectionRoutes,
  OptimizeCollectionRoutesInput,
  OptimizeCollectionRoutesOutput,
} from '@/ai/flows/optimize-collection-routes';
import { z } from 'zod';
import type { WasteApplication } from './lib/types';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };


export async function runRouteOptimizationAction(
  applications: WasteApplication[]
): Promise<ActionResult<OptimizeCollectionRoutesOutput>> {
    if(!applications || applications.length === 0) {
        return { success: false, error: 'No pending applications to optimize.' };
    }

  const input: OptimizeCollectionRoutesInput = {
    wasteApplications: applications.map(app => ({
        applicationId: app.id,
        address: app.address,
        latitude: app.locationLatitude,
        longitude: app.locationLongitude,
        wasteType: app.wasteType,
        quantity: String(app.quantity),
        department: app.departmentId,
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
