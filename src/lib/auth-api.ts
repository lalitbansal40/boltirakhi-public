const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

/**
 * Customer sign-in.
 *
 * The session is an httpOnly cookie, which JavaScript cannot read — so there
 * is no token to store or pass around here. Every call sets
 * `credentials: 'include'` instead; without it the browser simply omits the
 * cookie and every request looks like a signed-out one.
 */

export interface AuthUser {
  id: string;
  name: string | null;
  phone: string | null;
  role: string;
}

export class ApiCallError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly retryAfterSeconds?: number,
  ) {
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
    | { data?: T; error?: { message?: string; code?: string; details?: { retryAfterSeconds?: number } } }
    | null;

  if (!response.ok) {
    // The server's message is written for the customer to read, so it is used
    // as-is rather than replaced with something vaguer.
    throw new ApiCallError(
      payload?.error?.message ?? 'Something went wrong. Please try again.',
      response.status,
      payload?.error?.code,
      payload?.error?.details?.retryAfterSeconds,
    );
  }

  return payload?.data as T;
}

export function requestOtp(phone: string) {
  return call<{ expiresInSeconds: number }>('/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function verifyOtp(phone: string, code: string) {
  return call<{ user: AuthUser }>('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
}

export function fetchMe() {
  return call<{ user: AuthUser }>('/auth/me');
}

export function logout() {
  return call<null>('/auth/logout', { method: 'POST' });
}
