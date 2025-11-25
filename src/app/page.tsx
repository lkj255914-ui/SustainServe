import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, School } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="bg-primary/10 py-4 text-center text-primary-foreground">
        <div className="container mx-auto flex items-center justify-center gap-4 px-4">
          <Image
            src="/mit-logo.png"
            alt="Maharaja Institute of Technology Logo"
            width={50}
            height={50}
            className="h-12 w-12 object-contain"
          />
          <h1 className="font-headline text-2xl font-bold tracking-wider">
            MAHARAJA INSTITUTE OF TECHNOLOGY THANDAVAPURA
          </h1>
        </div>
      </div>
      <Navbar />
      <main className="flex-1">
        <section className="relative h-[60vh] min-h-[500px] w-full">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
            <h1 className="font-headline text-5xl font-bold md:text-7xl">
              Turn Waste into Wisdom
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl">
              An intelligent platform for efficient and sustainable waste
              management. Streamline collection, optimize routes, and make a
              greener impact.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/auth">
                Get Started <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 py-16">
          <h2 className="font-headline text-center text-4xl font-bold">
            Features
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                >
                  <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v5" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="m4.1 12.4 2.8 2.8" />
                  <path d="M10 18H5c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1h5" />
                  <path d="m7 15-2-2 2-2" />
                </svg>
              </div>
              <h3 className="font-headline mt-4 text-2xl font-semibold">
                Smart Applications
              </h3>
              <p className="mt-2 text-muted-foreground">
                Easily submit waste disposal requests with photo uploads and
                AI-powered type verification.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                >
                  <path d="M15 15.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" />
                  <path d="M18.5 13V4.5a2 2 0 0 0-2-2h-11a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
                  <path d="M15 9h-5" />
                  <path d="M15 6H7" />
                </svg>
              </div>
              <h3 className="font-headline mt-4 text-2xl font-semibold">
                Admin Dashboard
              </h3>
              <p className="mt-2 text-muted-foreground">
                A powerful dashboard for admins to manage all applications and
                gain insights.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                >
                  <path d="M10.1 2.14c.3-.2.6-.3.9-.3.3 0 .6.1.9.3l7.3 4.6c.3.2.5.5.5.9v9.2c0 .3-.2.6-.5.9l-7.3 4.6c-.3.2-.6.3-.9.3s-.6-.1-.9-.3l-7.3-4.6a2 2 0 0 1-.5-.9V7.6c0-.3.2-.6.5-.9Z" />
                  <path d="M12 22V12" />
                  <path d="m12 12-7.3-4.6" />
                  <path d="m21.2 7-9.2 5.8" />
                  <path d="m3.8 7 8.4 5.2" />
                  <path d="m12 12-2.1-7.9" />
                </svg>
              </div>
              <h3 className="font-headline mt-4 text-2xl font-semibold">
                Intelligent Routing
              </h3>
              <p className="mt-2 text-muted-foreground">
                Leverage GenAI to optimize waste collection routes, saving time
                and resources.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="container mx-auto border-t px-4 py-6">
        <p className="text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} WasteWise - MAHARAJA INSTITUTE OF TECHNOLOGY THANDAVAPURA. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
