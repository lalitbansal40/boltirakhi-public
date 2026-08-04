'use client';

import { ImageOff, Play } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { StoredImage, StoredVideo } from '@/lib/types';

type Slide = { kind: 'image'; image: StoredImage } | { kind: 'video'; video: StoredVideo };

export function ProductGallery({
  images,
  video,
  title,
}: {
  images: StoredImage[];
  video?: StoredVideo;
  title: string;
}) {
  const slides: Slide[] = [
    ...images.map((image) => ({ kind: 'image' as const, image })),
    ...(video ? [{ kind: 'video' as const, video }] : []),
  ];

  const [active, setActive] = useState(0);
  const current = slides[active];

  // Every product entered so far has no image at all, so this is the normal
  // case rather than an edge one.
  if (slides.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[var(--radius-card)] border border-line bg-accent-soft/30">
        <ImageOff className="size-10 text-muted/50" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] border border-line bg-accent-soft/30">
        {current?.kind === 'video' ? (
          // controls, never autoPlay: most of this traffic arrives on mobile
          // data, and a video that starts itself spends someone's money and
          // battery without being asked.
          <video
            src={current.video.url}
            poster={current.video.thumbUrl ?? images[0]?.url}
            controls
            preload="metadata"
            className="size-full bg-black object-contain"
          />
        ) : current?.kind === 'image' ? (
          <Image
            src={current.image.url}
            alt={current.image.alt ?? title}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>

      {slides.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {slides.map((slide, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={slide.kind === 'video' ? 'Play video' : `Image ${index + 1}`}
              className={cn(
                'relative size-16 overflow-hidden rounded-md border bg-accent-soft/30',
                index === active ? 'border-brand' : 'border-line',
              )}
            >
              {slide.kind === 'video' ? (
                <>
                  {slide.video.thumbUrl ? (
                    <Image src={slide.video.thumbUrl} alt="" fill sizes="64px" className="object-cover" />
                  ) : null}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="size-5 text-white" aria-hidden />
                  </span>
                </>
              ) : (
                <Image src={slide.image.url} alt="" fill sizes="64px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
