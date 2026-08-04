'use client';

// 'use client' is required here — an error boundary needs state and an event
// handler, and the build fails without it.
import { Button } from '@/components/ui/button';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-bold text-brand">
        Something went wrong
      </h1>
      <p className="mt-2 text-muted">
        That is on us. Try again, and write to us if it keeps happening.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
