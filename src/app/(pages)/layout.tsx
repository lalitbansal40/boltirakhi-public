/**
 * Shared frame for the flat content pages — legal text, help, contact.
 *
 * These are placeholders through Phase 0. Razorpay will not activate live
 * payments without real Privacy, Terms, Refund and Shipping pages, so the
 * copy has to be written before Phase 8.
 */
export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-brand [&_p]:text-muted">
      {children}
    </div>
  );
}
