'use client';

import type { LucideIcon } from 'lucide-react';
import { PackageOpen, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/api';

/**
 * The three states every list ends up needing.
 *
 * Written once here because the admin panel learned this the hard way — each
 * screen grew its own version and they drifted into three different shapes
 * before being pulled back together.
 */
export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface px-6 py-12 text-center">
      <p className="font-medium text-ink">We could not load this</p>
      <p className="mt-1 text-sm text-muted">{errorMessage(error)}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface px-6 py-14 text-center">
      <Icon className="mx-auto size-8 text-muted/60" aria-hidden />
      <p className="mt-3 font-medium text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
