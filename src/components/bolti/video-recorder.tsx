'use client';

import { Circle, Square, Upload, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

/** Long enough for a message, short enough to upload over mobile data. */
const MAX_SECONDS = 60;

/**
 * Pick a container the browser will actually produce.
 *
 * iOS Safari records mp4, Android Chrome records webm, and asking for the
 * wrong one gives an empty file rather than an error. The backend accepts
 * both, so the browser's own preference is honoured.
 */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;

  const candidates = ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export function VideoRecorder({
  onReady,
  disabled,
}: {
  onReady: (file: File) => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [denied, setDenied] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  /**
   * Release the camera when this component goes away.
   *
   * Without it the recording light stays on after the page changes, which
   * looks like the site is still watching — and people who see that do not
   * come back.
   */
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Hard stop at a minute, with the count visible the whole time.
  useEffect(() => {
    if (!recording) return;

    if (seconds >= MAX_SECONDS) {
      stop();
      return;
    }

    const timer = setTimeout(() => setSeconds((value) => value + 1), 1000);
    return () => clearTimeout(timer);
  }, [recording, seconds]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type });
        const extension = type.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `message.${extension}`, { type: type.split(';')[0] });

        streamRef.current?.getTracks().forEach((track) => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;

        const url = URL.createObjectURL(blob);
        setPreview(url);
        onReady(file);
      };

      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setRecording(true);
    } catch {
      /**
       * Permission refused, or no camera at all.
       *
       * This is common enough that it cannot be a dead end — the whole point
       * of the product is behind this step, so the file picker below has to
       * carry anyone the camera cannot.
       */
      setDenied(true);
    }
  }

  function stop() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <video
          src={preview}
          controls
          playsInline
          className="w-full rounded-[var(--radius-card)] bg-black"
        />
      ) : (
        <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="aspect-[3/4] w-full object-cover sm:aspect-video"
          />
          {recording && (
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
              <Circle className="size-3 animate-pulse fill-red-500 text-red-500" aria-hidden />
              {seconds}s / {MAX_SECONDS}s
            </div>
          )}
        </div>
      )}

      {denied ? (
        <div className="rounded-[var(--radius-card)] border border-line p-4 text-sm">
          <p className="text-ink">We could not use your camera.</p>
          <p className="mt-1 text-muted">
            You can still record with your phone&apos;s own camera app and choose the
            file here.
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          {recording ? (
            <Button onClick={stop} variant="outline" className="flex-1">
              <Square className="size-4" aria-hidden />
              Stop
            </Button>
          ) : (
            <Button onClick={start} disabled={disabled} className="flex-1">
              <Video className="size-4" aria-hidden />
              {preview ? 'Record again' : 'Record a video'}
            </Button>
          )}
        </div>
      )}

      {/* Always present, not only after a failure: some people would simply
          rather use a video they already have. */}
      <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-line px-4 text-sm text-ink hover:bg-accent-soft">
        <Upload className="size-4" aria-hidden />
        Choose a video instead
        <input
          type="file"
          accept="video/*"
          capture="user"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setPreview(URL.createObjectURL(file));
            onReady(file);
          }}
        />
      </label>
    </div>
  );
}
