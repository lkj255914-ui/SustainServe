'use client';

import { useMemo, useState } from 'react';
import { useCollection } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import { ApplicationsTable } from '@/components/admin/applications-table';
import { RouteOptimizer } from '@/components/admin/route-optimizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { WasteApplication } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const applicationsQuery = useMemo(
    () => (firestore ? query(collection(firestore, 'wasteApplications')) : null),
    [firestore]
  );
  const {
    data: applications,
    isLoading: isLoadingApplications,
    error,
  } = useCollection<WasteApplication>(applicationsQuery);

  const [selectedApplications, setSelectedApplications] = useState<
    WasteApplication[]
  >([]);

  if (isUserLoading || isLoadingApplications) {
    return (
      <div>
        <Skeleton className="h-8 w-1/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (user?.email !== 'jpratap731@gmail.com') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }
  
  if (error) {
    return <div>Error loading applications: {error.message}</div>
  }

  const pendingApplications =
    applications?.filter((app) => app.status === 'Pending') || [];

  return (
    <div className="animate-in fade-in-0">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Admin Dashboard
      </h1>
      <p className="text-muted-foreground">
        Manage applications and optimize collection routes.
      </p>

      <Tabs defaultValue="applications" className="mt-6">
        <TabsList>
          <TabsTrigger value="applications">All Applications</TabsTrigger>
          <TabsTrigger value="optimizer">Route Optimizer</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          <ApplicationsTable
            applications={applications || []}
            selectedApplications={selectedApplications}
            setSelectedApplications={setSelectedApplications}
          />
        </TabsContent>
        <TabsContent value="optimizer">
          <RouteOptimizer applications={pendingApplications} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
