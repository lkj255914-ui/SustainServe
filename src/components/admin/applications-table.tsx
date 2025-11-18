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
import { CheckCircle, HelpCircle, Loader2, XCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

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

  const handleStatusUpdate = (
    applicationId: string,
    newStatus: 'approved' | 'rejected'
  ) => {
    startTransition(async () => {
      const result = await updateApplicationStatusAction(
        applicationId,
        newStatus
      );
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
  };

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
        <TooltipProvider>
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
                <TableHead>User Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Waste Type</TableHead>
                <TableHead>Quantity (kg)</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Live Location
                </TableHead>
                <TableHead>Date</TableHead>
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
                      checked={selectedApplications.some(
                        (a) => a.id === app.id
                      )}
                      onCheckedChange={(checked) =>
                        handleSelectRow(app, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {app.id.substring(0, 7)}
                  </TableCell>
                  <TableCell>{app.userEmail}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger>
                        {app.isVerified === true && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {app.isVerified === false && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {app.isVerified === undefined && (
                           <HelpCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{app.verificationNotes || 'Verification not performed.'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{app.wasteType}</TableCell>
                  <TableCell>{app.quantity}</TableCell>
                  <TableCell>{app.departmentId}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {app.address}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {app.locationLatitude && app.locationLongitude
                      ? `${app.locationLatitude.toFixed(
                          4
                        )}, ${app.locationLongitude.toFixed(4)}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {new Date(app.submissionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {app.status === 'submitted' ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(app.id, 'approved')
                          }
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Approve'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleStatusUpdate(app.id, 'rejected')
                          }
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Reject'
                          )}
                        </Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TooltipProvider>
        {applications.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No applications found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
