const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export interface BoltiDraft {
  token: string;
  status: 'draft' | 'ready' | 'qr_failed';
  letterText: string | null;
  senderName: string | null;
  receiverName: string | null;
  hasVideo: boolean;
  photoCount: number;
  revealUrl: string | null;
}

export interface PresignResult {
  key: string;
  uploadUrl: string;
  /** Echoed back so the browser sends exactly what was signed. */
  contentType: string;
  expiresIn: number;
}

export class BoltiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  const payload = (await response.json().catch(() => null)) as
    | { data?: T; error?: { message?: string; code?: string } }
    | null;

  if (!response.ok) {
    throw new BoltiError(
      payload?.error?.message ?? 'Something went wrong. Please try again.',
      response.status,
      payload?.error?.code,
    );
  }

  return payload?.data as T;
}

export function getDraft(token: string) {
  return call<{ bolti: BoltiDraft }>(`/bolti/${token}`);
}

export function saveDraft(
  token: string,
  input: { letterText?: string; senderName?: string; receiverName?: string },
) {
  return call<{ bolti: BoltiDraft }>(`/bolti/${token}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function presignVideo(token: string, file: File) {
  return call<PresignResult>(`/bolti/${token}/video`, {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name || 'message.webm',
      contentType: file.type,
      sizeBytes: file.size,
    }),
  });
}

export function presignPhoto(token: string, file: File) {
  return call<PresignResult>(`/bolti/${token}/photos`, {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    }),
  });
}

export function submitDraft(token: string) {
  return call<{ bolti: BoltiDraft }>(`/bolti/${token}/submit`, { method: 'POST' });
}

/**
 * Upload straight to S3, reporting progress.
 *
 * XMLHttpRequest rather than fetch: fetch cannot report upload progress, and a
 * 50MB video over mobile data with no progress bar is a screen people close
 * because they assume it has hung.
 */
export function uploadToS3(
  url: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', url);
    // Must match what was signed, or S3 rejects the signature.
    request.setRequestHeader('Content-Type', contentType);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error('Upload failed. Please try again.'));

    request.onerror = () => reject(new Error('Upload failed. Check your connection.'));
    request.send(file);
  });
}
