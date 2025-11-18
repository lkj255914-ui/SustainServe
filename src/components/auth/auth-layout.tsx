import type { ReactNode } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '../logo';

export function AuthLayout({ children }: { children: ReactNode }) {
  const authBg = PlaceHolderImages.find((p) => p.id === 'auth-bg');

  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
      <div className="relative hidden items-center justify-center bg-muted lg:flex">
        {authBg && (
          <Image
            src={authBg.imageUrl}
            alt={authBg.description}
            fill
            className="object-cover"
            data-ai-hint={authBg.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
        <div className="relative z-10 flex flex-col gap-4 p-10 text-white">
          <Logo />
          <p className="mt-4 font-headline text-3xl font-bold">
            "The greatest threat to our planet is the belief that someone else
            will save it."
          </p>
          <footer className="text-lg font-medium">- Robert Swan</footer>
        </div>
      </div>
    </div>
  );
}
