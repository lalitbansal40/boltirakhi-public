import type { Metadata } from 'next';

import { AccountView } from '@/components/auth/account-view';

export const metadata: Metadata = {
  title: 'Your account',
  // One person's page, behind a login. robots.ts already disallows /account;
  // this repeats it for crawlers arriving on a direct link.
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Your account</h1>
      <div className="mt-6">
        <AccountView />
      </div>
    </div>
  );
}
