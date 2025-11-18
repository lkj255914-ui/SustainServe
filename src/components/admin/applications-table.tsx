'use client';

import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { WasteApplication } from '@/lib/types';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { updateApplicationStatusAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';

function getStatusBadge(status: WasteApplication['status']) {
  switch (status) {
    case 'submitted':
      return <Badge variant="secondary">Pending</Badge>;
    case 'approved':
      return <Badge>Approved</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function ApplicationsTable({
  applications,
  selectedApplications,
  setSelectedApplications,
}: {
  applications: WasteApplication[];
  selectedApplications: WasteApplication[];
  setSelectedApplications: (applications: WasteApplication[]) => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(applications);
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectRow = (
    application: WasteApplication,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedApplications([...selectedApplications, application]);
    } else {
      setSelectedApplications(
        selectedApplications.filter((a) => a.id !== application.id)
      );
    }
  };

  const handleStatusUpdate = (applicationId: string, newStatus: 'approved' | 'rejected') => {
    startTransition(async () => {
      const result = await updateApplicationStatusAction(applicationId, newStatus);
      if (result.success) {
        toast({
            title: `Application ${newStatus}`,
            description: `The application has been successfully ${newStatus}.`,
        });
      } else {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: result.error,
        });
      }
    });
  }

  const isAllSelected =
    applications.length > 0 &&
    selectedApplications.length === applications.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Waste Applications</CardTitle>
        <CardDescription>
          A complete list of all submitted applications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Waste Type</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="hidden md:table-cell">Address</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Photo</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow
                key={app.id}
                data-state={
                  selectedApplications.some((a) => a.id === app.id)
                    ? 'selected'
                    : ''
                }
              >
                <TableCell>
                  <Checkbox
                    checked={selectedApplications.some((a) => a.id === app.id)}
                    onCheckedChange={(checked) =>
                      handleSelectRow(app, !!checked)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{app.id.substring(0, 7)}</TableCell>
                <TableCell>{getStatusBadge(app.status)}</TableCell>
                <TableCell>{app.wasteType}</TableCell>
                <TableCell>{app.departmentId}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {app.address}
                </TableCell>
                <TableCell>{new Date(app.submissionDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {app.photoUrl && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Waste Photo</DialogTitle>
                        </DialogHeader>
                        <div className="relative h-96 w-full">
                           <Image
                            src={app.photoUrl}
                            alt="Waste"
                            fill
                            className="object-contain rounded-md"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
                <TableCell>
                  {app.status === 'submitted' ? (
                    <div className="flex gap-2">
                       <Button size="sm" onClick={() => handleStatusUpdate(app.id, 'approved')} disabled={isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(app.id, 'rejected')} disabled={isPending}>
                         {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
                      </Button>
                    </div>
                  ) : null }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {applications.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
                No applications found.
            </div>
        )}
      </CardContent>
    </Card>
  );
}