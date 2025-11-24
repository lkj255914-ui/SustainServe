'use client';

import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/components/login-form';
import { SignupForm } from '@/components/signup-form';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import Link from 'next/link';

function AuthPageContent() {
  const searchParams = useSearchParams();
  const initialForm = searchParams.get('form') || 'login';
  const [formType, setFormType] = useState<'login' | 'signup'>(
    initialForm === 'signup' ? 'signup' : 'login'
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="flex justify-center mb-4">
           <Logo />
        </Link>
        <CardTitle className="font-headline text-2xl">
          {formType === 'login' ? 'Welcome Back' : 'Create an Account'}
        </CardTitle>
        <CardDescription>
          {formType === 'login'
            ? 'Enter your details to access your account.'
            : 'Fill in the details below to create a new account.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-muted rounded-lg">
          <Button
            variant={formType === 'login' ? 'secondary' : 'ghost'}
            onClick={() => setFormType('login')}
            className={cn("transition-all", formType === 'login' && "shadow-sm")}
          >
            Login
          </Button>
          <Button
            variant={formType === 'signup' ? 'secondary' : 'ghost'}
            onClick={() => setFormType('signup')}
            className={cn("transition-all", formType === 'signup' && "shadow-sm")}
          >
            Sign Up
          </Button>
        </div>
        <div className="animate-in fade-in-50">
            {formType === 'login' ? <LoginForm /> : <SignupForm />}
        </div>
      </CardContent>
    </Card>
  );
}


export default function AuthPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <AuthPageContent />
            </Suspense>
        </div>
    )
}