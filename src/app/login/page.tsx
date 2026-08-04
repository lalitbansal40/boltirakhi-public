import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <h1 className="text-center font-heading text-2xl font-bold text-ink">Sign in</h1>
      <p className="mt-2 text-center text-muted">
        Sign in with your mobile number to place an order.
      </p>

      <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        {/*
          LoginForm reads ?next= through useSearchParams, which suspends. Without
          this boundary `next build` fails on prerender while `next dev` passes
          quite happily — so the failure only shows up at deploy time.
        */}
        <Suspense fallback={<div className="py-8 text-center text-muted">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
