'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { APP_NAME } from '@novanode/shared';
import { setupAction, type AuthFormState } from '@/app/actions/auth';
import { Footer } from '@/components/footer';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AuthFormState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
      {pending ? 'Membuat akun…' : 'Create Owner Account'}
    </Button>
  );
}

export default function SetupPage() {
  const [state, formAction] = useActionState(setupAction, initialState);

  return (
    <div className="bg-aurora flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-gradient-brand grid h-9 w-9 place-items-center rounded-lg text-sm font-bold text-white shadow-md shadow-indigo-500/20">
            N
          </span>
          <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              <span className="text-gradient-brand">Setup Wizard</span>
            </CardTitle>
            <CardDescription>
              Buat akun Owner pertama untuk NovaNode. Akun ini memiliki hak akses penuh.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="Nama lengkap" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" placeholder="username" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" placeholder="you@example.com" required />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" name="password" placeholder="••••••••" required minLength={8} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" name="confirm" placeholder="••••••••" required minLength={8} />
                </div>
              </div>
              {state.error && <p className="text-sm text-destructive">{state.error}</p>}
              <SubmitButton />
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
