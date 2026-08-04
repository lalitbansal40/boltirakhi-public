import axios, { type AxiosError, type AxiosInstance } from 'axios';

import { API_ERROR, type ApiErrorBody, type ErrorDetails, type FieldError } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: ErrorDetails;

  constructor(message: string, code: string, status: number, details?: ErrorDetails) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  get isValidation(): boolean {
    return this.code === API_ERROR.VALIDATION;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /** Per-field validation errors, or undefined when `details` is context. */
  get fieldErrors(): FieldError[] | undefined {
    return Array.isArray(this.details) ? this.details : undefined;
  }

  /**
   * A single value out of the context object.
   *
   * `details` arrives in two shapes: an array of field errors from validation,
   * or a plain object of context from a rule — a coupon below its minimum
   * comes back as `{ minOrderPaise, shortByPaise }`, and the shortfall is what
   * lets the cart say "add ₹200 more" instead of "minimum ₹999".
   */
  detail<T = unknown>(key: string): T | undefined {
    const { details } = this;
    if (!details || Array.isArray(details)) return undefined;
    return details[key] as T | undefined;
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Deliberately no auth here.
 *
 * The admin client attaches a bearer token to every request and redirects to
 * /login on a 401. On a storefront that would be actively harmful: a visitor
 * browses without an account, and throwing them at a login screen is the
 * fastest way to lose them. Tokens arrive in Phase 3, attached only to the
 * calls that actually need one — and a 401 will still never redirect.
 */
api.interceptors.response.use(
  (response) => {
    // The backend wraps everything in { success, data }. Unwrapping here means
    // no call site has to remember to.
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  (error: AxiosError<ApiErrorBody>) => {
    // No response at all: backend down, DNS, CORS, timeout.
    if (!error.response) {
      const offline =
        error.code === 'ECONNABORTED'
          ? 'The server took too long to respond.'
          : 'Cannot reach the server right now.';
      return Promise.reject(new ApiClientError(offline, 'NETWORK_ERROR', 0));
    }

    const { status, data } = error.response;
    const body = data?.error;

    return Promise.reject(
      new ApiClientError(
        body?.message ?? 'Something went wrong',
        body?.code ?? 'UNKNOWN',
        status,
        body?.details,
      ),
    );
  },
);

export function isApiError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

export function errorMessage(error: unknown): string {
  return isApiError(error) ? error.message : 'Something went wrong';
}
