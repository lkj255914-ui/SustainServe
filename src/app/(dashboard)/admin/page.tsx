'use client';

import { useMemo, useState } from 'react';
import { useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase/provider';
import { ApplicationsTable } from '@/components/admin/applications-table';
import { RouteOptimizer } from '@/components/admin/route-optimizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { WasteApplication } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Building } from 'lucide-react';

const departments = [
  'All',
  'Facilities',
  'IT',
  'HR',
  'Operations',
  'Marketing',
];

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [selectedDept, setSelectedDept] = useState('All');

  const applicationsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(
            collection(firestore, 'wasteApplications'),
            orderBy('submissionDate', 'desc')
          )
        : null,
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

  const filteredApplications = useMemo(
    () =>
      applications?.filter(
        (app) => selectedDept === 'All' || app.departmentId === selectedDept
      ) || [],
    [applications, selectedDept]
  );

  const pendingApplications = useMemo(
    () => filteredApplications.filter((app) => app.status === 'submitted') || [],
    [filteredApplications]
  );

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
    return <div>Error loading applications: {error.message}</div>;
  }

  return (
    <div className="animate-in fade-in-0">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Admin Dashboard
      </h1>
      <p className="text-muted-foreground">
        Manage applications and optimize collection routes by department.
      </p>

      <div className="my-6">
        <h2 className="text-lg font-semibold mb-2">Filter by Department</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {departments.map((dept) => (
            <Card
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={cn(
                'cursor-pointer hover:bg-muted/80 transition-colors',
                selectedDept === dept && 'bg-muted ring-2 ring-primary'
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{dept}</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dept === 'All'
                    ? applications?.length || 0
                    : applications?.filter((a) => a.departmentId === dept)
                        .length || 0}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs defaultValue="applications" className="mt-6">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="optimizer">Route Optimizer</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          <ApplicationsTable
            applications={filteredApplications}
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
