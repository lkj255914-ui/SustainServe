'use client';

import {
  Activity,
  ArrowUpRight,
  BadgeCent,
  Recycle,
  Trash,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { WasteApplication } from '@/lib/types';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function getStatusBadge(status: WasteApplication['status']) {
  switch (status) {
    case 'submitted':
      return <Badge variant="secondary">Pending</Badge>;
    case 'approved':
      return <Badge>Collected</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    default:
        return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userApplicationsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'wasteApplications'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const {
    data: userApplications,
    isLoading: isLoadingApplications,
    error,
  } = useCollection<WasteApplication>(userApplicationsQuery);

  if (isUserLoading || isLoadingApplications) {
    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8 animate-in fade-in-0">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-6 w-12" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-6 w-12" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-6 w-12" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-6 w-12" /></CardContent></Card>
        </div>
        <Card>
            <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-destructive">Error: {error.message}</div>
  }

  const totalApplications = userApplications?.length || 0;
  const pendingApplications =
    userApplications?.filter((app) => app.status === 'submitted').length || 0;
  const totalQuantity =
    userApplications?.reduce((acc, app) => acc + (app.quantity || 0), 0) || 0;

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8 animate-in fade-in-0">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              All-time submissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Applications
            </CardTitle>
            <Trash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting collection
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waste</CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity} kg</div>
            <p className="text-xs text-muted-foreground">
              Total waste generated
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Efficiency Score
            </CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              Your contribution to sustainability
            </p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                A list of your recent waste applications.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/apply">
                New Application
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Waste Type</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Department
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Submission Date
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userApplications && userApplications.slice(0, 5).map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.id.substring(0,7)}</TableCell>
                    <TableCell>{app.wasteType}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {app.departmentId}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(app.submissionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!userApplications || userApplications.length === 0) && (
              <div className="text-center py-10 text-muted-foreground">
                No applications found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
