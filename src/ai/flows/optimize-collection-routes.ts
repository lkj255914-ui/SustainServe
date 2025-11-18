'use server';

/**
 * @fileOverview Optimizes waste collection routes using AI.
 *
 * - optimizeCollectionRoutes - A function that optimizes waste collection routes.
 * - OptimizeCollectionRoutesInput - The input type for the optimizeCollectionRoutes function.
 * - OptimizeCollectionRoutesOutput - The return type for the optimizeCollectionRoutes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WasteApplicationSchema = z.object({
  applicationId: z.string().describe('Unique identifier for the waste application.'),
  address: z.string().describe('Address where the waste is located.'),
  latitude: z.number().describe('Latitude of the waste location.'),
  longitude: z.number().describe('Longitude of the waste location.'),
  wasteType: z.string().describe('Type of waste (e.g., recyclable, hazardous).'),
  quantity: z.string().describe('The quantity of waste.'),
  department: z.string().describe('The originating department for the waste.'),
  submissionDate: z.string().describe('The date the application was submitted.'),
});

const OptimizeCollectionRoutesInputSchema = z.object({
  wasteApplications: z.array(WasteApplicationSchema).describe('Array of waste applications to be collected.'),
  vehicleCapacity: z.number().describe('The capacity of the collection vehicle.'),
  depotLocation: z.object({
    latitude: z.number().describe('Latitude of the depot location.'),
    longitude: z.number().describe('Longitude of the depot location.'),
  }).describe('The latitude and longitude coordinates of the depot location.'),
});

export type OptimizeCollectionRoutesInput = z.infer<typeof OptimizeCollectionRoutesInputSchema>;

const RouteSchema = z.object({
  routeId: z.string().describe('Unique identifier for the route.'),
  stops: z.array(z.string()).describe('An ordered list of waste application IDs to visit in this route.'),
  totalWaste: z.string().describe('Total amount of waste collected on this route.'),
  travelDistance: z.string().describe('The total travel distance for this route.'),
});

const OptimizeCollectionRoutesOutputSchema = z.object({
  routes: z.array(RouteSchema).describe('An array of optimized waste collection routes.'),
  summary: z.string().describe('A summary of the optimization, including total distance and applications covered.'),
});

export type OptimizeCollectionRoutesOutput = z.infer<typeof OptimizeCollectionRoutesOutputSchema>;

export async function optimizeCollectionRoutes(input: OptimizeCollectionRoutesInput): Promise<OptimizeCollectionRoutesOutput> {
  return optimizeCollectionRoutesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeCollectionRoutesPrompt',
  input: {schema: OptimizeCollectionRoutesInputSchema},
  output: {schema: OptimizeCollectionRoutesOutputSchema},
  prompt: `You are a waste management logistics expert. Given a list of waste applications with their locations, waste types, and quantities, your task is to generate optimized waste collection routes.

Each route should:
- Start and end at the depot location.
- Respect the vehicle capacity.
- Group applications by waste type to minimize sorting time.
- Minimize the total travel distance.

Input:
Depot Location: Latitude: {{depotLocation.latitude}}, Longitude: {{depotLocation.longitude}}
Vehicle Capacity: {{vehicleCapacity}}
Waste Applications:
{{#each wasteApplications}}
  - Application ID: {{applicationId}}, Address: {{address}}, Latitude: {{latitude}}, Longitude: {{longitude}}, Waste Type: {{wasteType}}, Quantity: {{quantity}}, Department: {{department}}, Submission Date: {{submissionDate}}
{{/each}}

Output the routes in JSON format, including a summary of the total distance covered and the number of applications included in the routes. Make sure each route adheres to vehicle capacity and waste type constraints.
`,
});

const optimizeCollectionRoutesFlow = ai.defineFlow(
  {
    name: 'optimizeCollectionRoutesFlow',
    inputSchema: OptimizeCollectionRoutesInputSchema,
    outputSchema: OptimizeCollectionRoutesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
