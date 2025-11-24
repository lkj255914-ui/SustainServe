import { Recycle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/dashboard" className={cn('flex items-center gap-2', className)}>
      <Recycle className="h-6 w-6 text-primary" />
      <span className="text-xl font-headline font-bold text-foreground">
        WasteWise
      </span>
    </Link>
  );
}
