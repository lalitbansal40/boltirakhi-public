'use client';

import { useEffect, useRef } from 'react';

const LENGTH = 6;

/**
 * Six boxes for a six-digit code.
 *
 * The attributes matter more than the boxes: `autoComplete="one-time-code"`
 * and a numeric keypad are what let Android and iOS offer the code straight
 * from the SMS, turning the slowest step of signing in into one tap.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first box on mount so the keyboard is already up.
    refs.current[0]?.focus();
  }, []);

  function setAt(index: number, digit: string) {
    const next = value.padEnd(LENGTH, ' ').split('');
    next[index] = digit;
    const joined = next.join('').replace(/\s/g, '').slice(0, LENGTH);

    onChange(joined);

    if (digit && index < LENGTH - 1) refs.current[index + 1]?.focus();
    if (joined.length === LENGTH) onComplete?.(joined);
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return;

    /**
     * A paste lands in one box as the whole code — and on Android the SMS
     * autofill arrives the same way. Spreading it across the boxes is what
     * makes both work.
     */
    if (digits.length > 1) {
      const filled = digits.slice(0, LENGTH);
      onChange(filled);
      refs.current[Math.min(filled.length, LENGTH - 1)]?.focus();
      if (filled.length === LENGTH) onComplete?.(filled);
      return;
    }

    setAt(index, digits);
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      // Backspace in an empty box steps back, which is what everyone expects
      // and what nobody implements.
      event.preventDefault();
      refs.current[index - 1]?.focus();
      onChange(value.slice(0, index - 1));
    }
  }

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="Verification code">
      {Array.from({ length: LENGTH }).map((_, index) => (
        <input
          // Fixed count, fixed order — the index is a stable identity here.
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          value={value[index] ?? ''}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          disabled={disabled}
          // Numeric keypad on phones; `numeric` rather than `tel` so there is
          // no * or # on the pad.
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={LENGTH}
          aria-label={`Digit ${index + 1}`}
          className="size-12 rounded-lg border border-line bg-surface text-center text-lg font-semibold text-ink outline-none transition-colors focus:border-brand focus:ring-3 focus:ring-brand/20 disabled:opacity-50 sm:size-14"
        />
      ))}
    </div>
  );
}
