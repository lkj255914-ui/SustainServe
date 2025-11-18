import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WasteApplication } from '@/lib/data';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

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

export function ApplicationsTable({
  applications,
}: {
  applications: WasteApplication[];
}) {
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
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Waste Type</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Address</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.applicationId}>
                <TableCell className="font-medium">
                  {app.applicationId}
                </TableCell>
                <TableCell>{getStatusBadge(app.status)}</TableCell>
                <TableCell>{app.wasteType}</TableCell>
                <TableCell>{app.department}</TableCell>
                <TableCell>{app.user}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {app.address}
                </TableCell>
                <TableCell>{app.submissionDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
