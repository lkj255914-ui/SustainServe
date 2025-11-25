'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Recycle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Recycle className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">WasteWise</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
           <Button variant="ghost" onClick={() => scrollTo('features')}>
            Features
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/auth">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/auth?form=signup">Get Started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
