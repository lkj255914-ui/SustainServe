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
import { MOCK_APPLICATIONS, WasteApplication } from '@/lib/data';

function getStatusBadge(status: WasteApplication['status']) {
    switch (status) {
        case 'Pending':
            return <Badge variant="secondary">Pending</Badge>;
        case 'Collected':
            return <Badge>Collected</Badge>;
        case 'Rejected':
            return <Badge variant="destructive">Rejected</Badge>;
    }
}

export default async function Dashboard() {
  const userApplications = MOCK_APPLICATIONS;
  const totalApplications = userApplications.length;
  const pendingApplications = userApplications.filter(app => app.status === 'Pending').length;
  const totalQuantity = userApplications.reduce((acc, app) => {
    const quantity = parseFloat(app.quantity) || 0;
    return acc + quantity;
  }, 0);


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
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
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
                  <TableHead>
                    Status
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userApplications.slice(0, 5).map(app => (
                    <TableRow key={app.applicationId}>
                        <TableCell className="font-medium">{app.applicationId}</TableCell>
                        <TableCell>{app.wasteType}</TableCell>
                        <TableCell className="hidden md:table-cell">{app.department}</TableCell>
                        <TableCell className="hidden md:table-cell">{app.submissionDate}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                         <TableCell>
                            <Button variant="ghost" size="sm">View</Button>
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
             {userApplications.length === 0 && (
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
