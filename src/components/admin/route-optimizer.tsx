'use client';

import { runRouteOptimizationAction } from '@/app/actions';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { useState, useTransition } from 'react';
import type { OptimizeCollectionRoutesOutput } from '@/ai/flows/optimize-collection-routes';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Truck } from 'lucide-react';
import type { WasteApplication } from '@/lib/types';
import { Separator } from '../ui/separator';

export function RouteOptimizer({
  applications,
}: {
  applications: WasteApplication[];
}) {
  const [isPending, startTransition] = useTransition();
  const [optimizedRoutes, setOptimizedRoutes] =
    useState<OptimizeCollectionRoutesOutput | null>(null);
  const { toast } = useToast();

  const handleOptimize = () => {
    startTransition(async () => {
      const result = await runRouteOptimizationAction(applications);
      if (result.success && result.data) {
        setOptimizedRoutes(result.data);
        toast({
          title: 'Routes Optimized',
          description: 'New collection routes have been generated.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Optimization Failed',
          description: result.error,
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intelligent Routing Tool</CardTitle>
        <CardDescription>
          Use AI to generate the most efficient collection routes for all pending
          applications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">
              {applications.length} Pending Applications
            </p>
            <p className="text-sm text-muted-foreground">
              Ready to be routed for collection.
            </p>
          </div>
          <Button onClick={handleOptimize} disabled={isPending || applications.length === 0}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Optimize Routes
          </Button>
        </div>

        {optimizedRoutes && (
          <div>
            <h3 className="font-headline text-xl font-semibold">
              Optimized Routes
            </h3>
            <p className="text-muted-foreground">{optimizedRoutes.summary}</p>
            <div className="mt-4 space-y-4">
              {optimizedRoutes.routes.map((route) => (
                <Card key={route.routeId} className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Truck className="h-5 w-5 text-primary" />
                      {route.routeId}
                    </CardTitle>
                    <CardDescription>
                      {route.totalWaste} | {route.travelDistance}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">Collection Stops:</p>
                    <ol className="mt-2 list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Depot (Start)</li>
                      {route.stops.map((stopId) => (
                        <li key={stopId}>
                          {
                            applications.find((a) => a.id === stopId)
                              ?.address
                          }{' '}
                          ({stopId})
                        </li>
                      ))}
                      <li>Depot (End)</li>
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
