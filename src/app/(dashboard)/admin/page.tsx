import { MOCK_APPLICATIONS } from '@/lib/data';
import { ApplicationsTable } from '@/components/admin/applications-table';
import { RouteOptimizer } from '@/components/admin/route-optimizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function AdminPage() {
  const applications = MOCK_APPLICATIONS;
  const pendingApplications = applications.filter(
    (app) => app.status === 'Pending'
  );

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
          <ApplicationsTable applications={applications} />
        </TabsContent>
        <TabsContent value="optimizer">
          <RouteOptimizer applications={pendingApplications} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
