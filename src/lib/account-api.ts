const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

/**
 * The customer's saved addresses.
 *
 * Same rule as auth-api: the session is an httpOnly cookie, so every call sets
 * `credentials: 'include'`. Leave it off and the browser omits the cookie, and
 * every request comes back 401 while looking perfectly well written.
 */

export interface Address {
  id: string;
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean };

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  const payload = (await response.json().catch(() => null)) as
    | { data?: T; error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Something went wrong. Please try again.');
  }

  return payload?.data as T;
}

/** Already sorted with the default first — do not re-sort in the UI. */
export function listAddresses() {
  return call<{ addresses: Address[] }>('/account/addresses');
}

export function createAddress(input: AddressInput) {
  return call<{ address: Address }>('/account/addresses', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function deleteAddress(id: string) {
  return call<null>(`/account/addresses/${id}`, { method: 'DELETE' });
}

/**
 * Make one address the default.
 *
 * Only this id is sent — the server clears the flag on the others, and doing
 * it here as well would be a second opinion that could disagree with it.
 */
export function setDefaultAddress(id: string) {
  return call<{ address: Address }>(`/account/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isDefault: true }),
  });
}

export function updateName(name: string) {
  return call<{ user: { id: string; name: string | null; phone: string | null } }>(
    '/account/profile',
    { method: 'PATCH', body: JSON.stringify({ name }) },
  );
}
