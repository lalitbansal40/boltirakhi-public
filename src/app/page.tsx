import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatPaise } from '@/lib/money';

/**
 * Temporary — Phase 0 Gate 1 only. It exists so the palette and the two fonts
 * can be looked at before anything is built on top of them. Task 234 replaces
 * it with the real home page.
 */
export default function Page() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-12">
      <div className="space-y-2">
        <Badge className="bg-accent-soft text-ink">Phase 0 · theme check</Badge>
        <h1 className="text-4xl font-bold text-brand">Bolti Rakhi</h1>
        <p className="text-muted">
          The heading is Fraunces, this line is Inter. Cream page, maroon brand,
          gold accent.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button>Add to cart</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>

      <Card className="space-y-2 p-5">
        <h2 className="text-xl font-semibold">Bhaiya Bhabhi Rakhi Set</h2>
        <p className="text-sm text-muted">
          A card, white against the cream page.
        </p>
        <p className="text-lg font-semibold text-brand">{formatPaise(49900)}</p>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['bg-brand', 'brand'],
          ['bg-accent', 'accent'],
          ['bg-accent-soft', 'accent-soft'],
          ['bg-surface border border-line', 'surface'],
        ].map(([cls, label]) => (
          <div key={label} className="space-y-1">
            <div className={`h-14 rounded-lg ${cls}`} />
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
