'use client';

import { Heart, Play } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Reveal {
  status: 'ready' | 'pending';
  message?: string;
  senderName?: string | null;
  receiverName?: string | null;
  letterText?: string | null;
  videoUrl?: string | null;
  videoThumbUrl?: string | null;
  photoUrls?: string[];
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

/**
 * What the brother sees when he scans the QR.
 *
 * No sign-in, ever. He has no account and will never make one — he has a
 * printed square on a box and about ten seconds of patience. Every step
 * between the scan and the message is a step where the gift is lost.
 */
export function RevealView({ token }: { token: string }) {
  const [data, setData] = useState<Reveal | null>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/r/${token}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => setData(payload.data))
      .catch(() => setFailed(true));
  }, [token]);

  if (failed) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">
          This link is not working
        </h1>
        <p className="mt-2 text-muted">
          Check the code on the packaging, or ask the sender to share it again.
        </p>
      </div>
    );
  }

  if (!data) return <div className="py-20 text-center text-muted">Opening…</div>;

  if (data.status === 'pending') {
    return (
      <div className="py-20 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">Not ready yet</h1>
        <p className="mt-2 text-muted">
          {data.message ?? 'This message has not been recorded yet. Try again soon.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div className="text-center">
        <Heart className="mx-auto size-8 text-brand" aria-hidden />
        <h1 className="mt-3 font-heading text-2xl font-bold text-ink">
          {data.senderName ? `${data.senderName} sent you this` : 'A message for you'}
        </h1>
        {data.receiverName && <p className="mt-1 text-muted">For {data.receiverName}</p>}
      </div>

      {data.videoUrl && (
        <div className="overflow-hidden rounded-[var(--radius-card)] bg-black">
          {playing ? (
            <video
              src={data.videoUrl}
              controls
              autoPlay
              // iOS takes over the whole screen without this.
              playsInline
              poster={data.videoThumbUrl ?? undefined}
              className="w-full"
            />
          ) : (
            /* Never autoplaying on load. He might open this standing next to
               someone, and a voice starting on its own takes the moment away
               from him. He presses play when he is ready. */
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="relative flex aspect-[3/4] w-full items-center justify-center sm:aspect-video"
            >
              {data.videoThumbUrl && (
                <Image
                  src={data.videoThumbUrl}
                  alt=""
                  fill
                  className="object-cover opacity-70"
                  unoptimized
                />
              )}
              <span className="relative flex size-16 items-center justify-center rounded-full bg-white/90">
                <Play className="ml-1 size-7 fill-brand text-brand" aria-hidden />
              </span>
              <span className="sr-only">Play the video message</span>
            </button>
          )}
        </div>
      )}

      {data.letterText && (
        /* A letter, not a form field: this is the part people read twice. */
        <div className="rounded-[var(--radius-card)] bg-accent-soft/60 p-5">
          <p className="whitespace-pre-line font-heading text-lg leading-relaxed text-ink">
            {data.letterText}
          </p>
          {data.senderName && (
            <p className="mt-4 text-right text-muted">— {data.senderName}</p>
          )}
        </div>
      )}

      {data.photoUrls && data.photoUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {data.photoUrls.map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-[var(--radius-card)]">
              <Image src={url} alt="" fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      )}

      {/* Shown only when the video could not be loaded, so a storage problem
          never leaves the page looking empty. */}
      {!data.videoUrl && !data.letterText && (!data.photoUrls || data.photoUrls.length === 0) && (
        <p className="text-center text-muted">
          This message could not be loaded right now. Please try again shortly.
        </p>
      )}
    </div>
  );
}
