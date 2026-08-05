'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DEFAULT_LANG,
  LANG_LABELS,
  LETTER_TEMPLATES,
  type LetterLang,
} from '@/lib/letter-templates';

/**
 * Ready-made letters, offered — never imposed.
 *
 * Two rules run through this:
 *
 *  1. Changing the language does not touch what she has written. She may be
 *     switching to read her own letter again, or comparing tones.
 *  2. Inserting a template over existing text asks first. Wiping a letter
 *     somebody was part way through writing is the kind of loss that stops
 *     them writing it again at all — and the letter is the whole point.
 */
export function LetterPicker({
  currentText,
  onUse,
}: {
  currentText: string;
  onUse: (text: string) => void;
}) {
  const [lang, setLang] = useState<LetterLang>(DEFAULT_LANG);

  function use(text: string) {
    if (currentText.trim().length > 0) {
      const ok = window.confirm(
        'This will replace what you have written. Continue?',
      );
      if (!ok) return;
    }
    onUse(text);
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-line p-3">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="letter-lang" className="text-sm text-muted">
          Not sure what to write?
        </label>
        <select
          id="letter-lang"
          value={lang}
          // Only swaps which templates are offered. The textarea is untouched.
          onChange={(event) => setLang(event.target.value as LetterLang)}
          className="min-h-11 rounded-md border border-line bg-surface px-2 text-sm text-ink outline-none focus:border-brand"
        >
          {(Object.keys(LANG_LABELS) as LetterLang[]).map((code) => (
            <option key={code} value={code}>
              {LANG_LABELS[code]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 space-y-2">
        {LETTER_TEMPLATES[lang].map((template) => (
          <div
            key={template.id}
            className="rounded-md bg-accent-soft/40 p-3"
            // Devanagari needs its own face; Inter has no glyphs for it and the
            // OS fallback renders unevenly enough to look like a bad
            // translation rather than a missing font.
            style={lang === 'hindi' ? { fontFamily: 'var(--font-devanagari)' } : undefined}
          >
            {/* Two lines of preview, so she knows what she is about to get. */}
            <p className="line-clamp-2 whitespace-pre-line text-sm text-muted">
              {template.text}
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => use(template.text)}
            >
              Use this — {template.label}
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted">
        Change any of it afterwards. Or skip the letter entirely — it is
        optional.
      </p>
    </div>
  );
}
