'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import { OtpInput } from '@/components/auth/otp-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiCallError, requestOtp, verifyOtp } from '@/lib/auth-api';

const RESEND_SECONDS = 60;

/**
 * Where to send someone after they sign in.
 *
 * Only paths on this site are accepted. An unchecked `?next=` is an open
 * redirect: a link that starts on boltirakhi.com and lands on a copy of it
 * asking for a card number, wearing our domain as its credential.
 *
 * `//evil.com` is the case that catches people out — it starts with a slash
 * and is still a different host.
 */
function safeNext(raw: string | null): string {
  if (!raw) return '/';
  if (!raw.startsWith('/')) return '/';
  if (raw.startsWith('//')) return '/';
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useAuth();

  const next = safeNext(params.get('next'));

  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Countdown for the resend link. Without a visible timer people press the
  // button repeatedly, hit the 429, and are told nothing they understand.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function sendCode(event?: React.FormEvent) {
    event?.preventDefault();
    setError(null);
    setBusy(true);

    try {
      await requestOtp(phone);
      setStep('code');
      setCode('');
      setSecondsLeft(RESEND_SECONDS);
    } catch (caught) {
      if (caught instanceof ApiCallError) {
        setError(caught.message);
        // The server knows exactly how long is left on the cooldown; showing
        // our own guess would be wrong by a few seconds either way.
        if (caught.retryAfterSeconds) {
          setSecondsLeft(caught.retryAfterSeconds);
          setStep('code');
        }
      } else {
        setError('Could not send the code. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(value: string) {
    setError(null);
    setBusy(true);

    try {
      const result = await verifyOtp(phone, value);
      setUser(result.user);
      router.push(next);
      // Deliberately not resetting `busy`: the page is navigating away, and
      // re-enabling the button first invites a second submission.
    } catch (caught) {
      setError(
        caught instanceof ApiCallError
          ? caught.message
          : 'Could not verify the code. Please try again.',
      );
      // Clear the boxes so retyping starts cleanly rather than requiring six
      // backspaces first.
      setCode('');
      setBusy(false);
    }
  }

  if (step === 'phone') {
    return (
      <form onSubmit={sendCode} className="space-y-4">
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-ink">
            Mobile number
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-lg border border-line px-3 py-2 text-muted">+91</span>
            <Input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="98765 43210"
              inputMode="numeric"
              autoComplete="tel"
              autoFocus
              required
            />
          </div>
          <p className="mt-2 text-sm text-muted">
            We will send you a 6-digit code. No password needed.
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={busy || phone.length < 10}>
          {busy ? 'Sending…' : 'Send code'}
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => {
          setStep('phone');
          setError(null);
        }}
        className="flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-brand"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Change number
      </button>

      <div>
        <p className="text-sm text-ink">
          Enter the code sent to <span className="font-medium">+91 {phone}</span>
        </p>
      </div>

      <OtpInput value={code} onChange={setCode} onComplete={submitCode} disabled={busy} />

      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      <Button
        size="lg"
        className="w-full"
        onClick={() => submitCode(code)}
        disabled={busy || code.length < 6}
      >
        {busy ? 'Verifying…' : 'Verify'}
      </Button>

      <p className="text-center text-sm text-muted">
        {secondsLeft > 0 ? (
          `Resend the code in ${secondsLeft}s`
        ) : (
          <button
            type="button"
            onClick={() => sendCode()}
            className="min-h-11 text-brand underline-offset-4 hover:underline"
          >
            Resend code
          </button>
        )}
      </p>
    </div>
  );
}
