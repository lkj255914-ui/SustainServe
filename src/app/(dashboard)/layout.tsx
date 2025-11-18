import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import type { User } from '@/lib/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SidebarNav user={user as User} />
      <div className="flex flex-col">
        <Header user={user as User} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
