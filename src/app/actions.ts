'use server';

import {
  optimizeCollectionRoutes,
  OptimizeCollectionRoutesInput,
  OptimizeCollectionRoutesOutput,
} from '@/ai/flows/optimize-collection-routes';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { WasteApplication } from './lib/types';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from './lib/firebase-admin';

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

export async function updateApplicationStatusAction(
  applicationId: string,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    await initAdmin();
    const db = getFirestore();
    const applicationRef = db.collection('wasteApplications').doc(applicationId);

    await applicationRef.update({ status });

    // Revalidate the path to update the cache on the client
    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return { success: false, error: error.message || 'Failed to update status.' };
  }
}