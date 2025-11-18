'use server';

import {
  optimizeCollectionRoutes,
  OptimizeCollectionRoutesInput,
  OptimizeCollectionRoutesOutput,
} from '@/ai/flows/optimize-collection-routes';
import {
    verifyWasteImage,
    VerifyWasteImageInput,
    VerifyWasteImageOutput,
} from '@/ai/flows/verify-waste-image';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { WasteApplication } from '@/lib/types';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase-admin';

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
        latitude: app.locationLatitude ?? 0,
        longitude: app.locationLongitude ?? 0,
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

export async function runWasteVerificationAction(
    input: VerifyWasteImageInput
): Promise<ActionResult<VerifyWasteImageOutput>> {
    if (!input.photoDataUri) {
        return { success: false, error: 'A photo is required for verification.' };
    }
    if (!input.wasteType) {
        return { success: false, error: 'A waste type is required for verification.' };
    }

    try {
        const output = await verifyWasteImage(input);
        return { success: true, data: output };
    } catch (e: any) {
        console.error(e);
        return { success: false, error: e.message || 'An unknown error occurred during verification.' };
    }
}
