'use client';

import { CheckCircle2, ImagePlus, Send } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useAuth } from '@/components/auth/auth-provider';
import { VideoRecorder } from '@/components/bolti/video-recorder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BoltiError,
  getDraft,
  presignPhoto,
  presignVideo,
  saveDraft,
  submitDraft,
  uploadToS3,
  type BoltiDraft,
} from '@/lib/bolti-api';

const MAX_LETTER = 500;
const MAX_PHOTOS = 5;

export function BoltiComposer({ token }: { token: string }) {
  const { isReady, isSignedIn } = useAuth();

  const [draft, setDraft] = useState<BoltiDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState('');
  const [senderName, setSenderName] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isReady || !isSignedIn) return;

    getDraft(token)
      .then((result) => {
        setDraft(result.bolti);
        setLetter(result.bolti.letterText ?? '');
        setSenderName(result.bolti.senderName ?? '');
      })
      .catch((caught: unknown) =>
        setError(
          caught instanceof BoltiError && caught.status === 404
            ? 'We could not find this message on your account.'
            : 'Could not load your message. Please try again.',
        ),
      );
  }, [isReady, isSignedIn, token]);

  if (!isReady) return <div className="py-16 text-center text-muted">Loading…</div>;

  if (!isSignedIn) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted">Sign in to record your message.</p>
        <Button
          className="mt-4"
          render={<Link href={`/login?next=/bolti/${token}`}>Sign in</Link>}
        />
      </div>
    );
  }

  if (error) return <p className="py-16 text-center text-destructive">{error}</p>;
  if (!draft) return <div className="py-16 text-center text-muted">Loading…</div>;

  // Already sent. The QR for this token is printed, so there is nothing left
  // to change — showing the form would invite an edit that cannot happen.
  if (draft.status !== 'draft') {
    return (
      <div className="py-12 text-center">
        <CheckCircle2 className="mx-auto size-10 text-brand" aria-hidden />
        <h2 className="mt-3 font-heading text-xl font-semibold text-ink">
          Your message is ready
        </h2>
        <p className="mt-2 text-muted">
          We will print the QR code on the packaging. Your brother scans it and
          watches this.
        </p>
      </div>
    );
  }

  async function upload(file: File, kind: 'video' | 'photo') {
    setBusy(true);
    setProgress(0);
    setError(null);

    try {
      const signed =
        kind === 'video' ? await presignVideo(token, file) : await presignPhoto(token, file);

      await uploadToS3(signed.uploadUrl, file, signed.contentType, setProgress);

      const refreshed = await getDraft(token);
      setDraft(refreshed.bolti);
    } catch (caught) {
      setError(
        caught instanceof BoltiError && caught.code === 'S3_NOT_CONFIGURED'
          ? 'Uploads are not switched on yet. Your letter still saves.'
          : caught instanceof Error
            ? caught.message
            : 'Upload failed. Please try again.',
      );
    } finally {
      setProgress(null);
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    try {
      await saveDraft(token, { letterText: letter, senderName });
      setError(null);
    } catch {
      setError('Could not save. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    setBusy(true);
    try {
      await saveDraft(token, { letterText: letter, senderName });
      const result = await submitDraft(token);
      setDraft(result.bolti);
    } catch (caught) {
      setError(caught instanceof BoltiError ? caught.message : 'Could not send. Try again.');
      setBusy(false);
    }
  }

  const hasSomething = draft.hasVideo || letter.trim().length > 0 || draft.photoCount > 0;

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-heading text-lg font-semibold text-ink">Record a video</h2>
        <p className="mt-1 text-sm text-muted">Up to 60 seconds. This is optional.</p>
        <div className="mt-3">
          <VideoRecorder onReady={(file) => upload(file, 'video')} disabled={busy} />
        </div>
        {draft.hasVideo && (
          <p className="mt-2 text-sm text-brand">Video saved.</p>
        )}
      </section>

      {progress !== null && (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-accent-soft">
            <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-center text-sm text-muted">Uploading… {progress}%</p>
        </div>
      )}

      <section>
        <h2 className="font-heading text-lg font-semibold text-ink">Write a letter</h2>
        <textarea
          value={letter}
          onChange={(event) => setLetter(event.target.value.slice(0, MAX_LETTER))}
          rows={5}
          placeholder="Something only the two of you would understand…"
          className="mt-2 w-full rounded-[var(--radius-card)] border border-line bg-surface p-3 text-ink outline-none focus:border-brand focus:ring-3 focus:ring-brand/20"
        />
        <p className="mt-1 text-right text-xs text-muted">
          {letter.length} / {MAX_LETTER}
        </p>

        <label className="mt-3 block text-sm font-medium text-ink" htmlFor="sender">
          Your name
        </label>
        <Input
          id="sender"
          value={senderName}
          onChange={(event) => setSenderName(event.target.value)}
          placeholder="So he knows who it is from"
          className="mt-1"
        />
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-ink">Add photos</h2>
        <p className="mt-1 text-sm text-muted">
          Up to {MAX_PHOTOS}. {draft.photoCount} added.
        </p>
        <label className="mt-2 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-line px-4 text-sm text-ink hover:bg-accent-soft">
          <ImagePlus className="size-4" aria-hidden />
          Choose a photo
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy || draft.photoCount >= MAX_PHOTOS}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload(file, 'photo');
            }}
          />
        </label>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-2 border-t border-line pt-4">
        {/* Said before the button is pressed, not after. */}
        <p className="text-sm text-muted">
          Once you send this, it cannot be changed — the QR code goes onto the
          packaging.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={save} disabled={busy}>
            Save for later
          </Button>
          <Button onClick={send} disabled={busy || !hasSomething} className="flex-1">
            <Send className="size-4" aria-hidden />
            Send this message
          </Button>
        </div>
      </div>
    </div>
  );
}
