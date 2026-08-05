import type { Metadata } from 'next';

import { AddressBook } from '@/components/account/address-book';

export const metadata: Metadata = {
  title: 'Your addresses',
  robots: { index: false, follow: false },
};

export default function AddressesPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Your addresses</h1>
      <div className="mt-6">
        <AddressBook />
      </div>
    </div>
  );
}
