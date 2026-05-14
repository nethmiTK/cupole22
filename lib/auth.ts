export const AUTH_KEYS = {
  token: 'adminToken',
  expiry: 'adminTokenExpiry',
  user: 'adminUser',
} as const;

const DEFAULT_AUTH_FALLBACK_MS = 8 * 60 * 60 * 1000;

const isBrowser = () => typeof window !== 'undefined';

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  if (typeof atob === 'function') {
    return atob(padded);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf8');
  }

  return '';
};

export const parseJwtExpiryMs = (token: string | null | undefined) => {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    if (typeof payload?.exp === 'number') {
      return payload.exp * 1000;
    }
  } catch {
    return null;
  }

  return null;
};

export const normalizeExpiryMs = (
  expiry: string | number | Date | null | undefined,
  token?: string | null,
) => {
  if (expiry instanceof Date) {
    return expiry.getTime();
  }

  if (typeof expiry === 'number' && Number.isFinite(expiry)) {
    return expiry < 1e12 ? expiry * 1000 : expiry;
  }

  if (typeof expiry === 'string' && expiry.trim()) {
    const numeric = Number(expiry);
    if (Number.isFinite(numeric)) {
      return numeric < 1e12 ? numeric * 1000 : numeric;
    }

    const parsedDate = new Date(expiry);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.getTime();
    }
  }

  return parseJwtExpiryMs(token ?? null);
};

export const resolveAuthExpiryMs = (
  data: Record<string, any> | null | undefined,
  token?: string | null,
) => {
  const explicitExpiry =
    data?.expiresAt ??
    data?.expiry ??
    data?.expires ??
    data?.tokenExpiry ??
    data?.user?.expiresAt ??
    data?.user?.expiry;

  const normalized = normalizeExpiryMs(explicitExpiry, token);
  if (normalized) return normalized;

  const expiresIn = data?.expiresIn ?? data?.user?.expiresIn;
  if (typeof expiresIn === 'number' && Number.isFinite(expiresIn)) {
    return Date.now() + expiresIn * 1000;
  }

  return parseJwtExpiryMs(token ?? null) ?? Date.now() + DEFAULT_AUTH_FALLBACK_MS;
};

export const getStoredToken = () => {
  if (!isBrowser()) return null;
  return localStorage.getItem(AUTH_KEYS.token);
};

export const getStoredExpiryMs = () => {
  if (!isBrowser()) return null;

  const rawExpiry = localStorage.getItem(AUTH_KEYS.expiry);
  const token = localStorage.getItem(AUTH_KEYS.token);

  return normalizeExpiryMs(rawExpiry, token);
};

export const getStoredUser = () => {
  if (!isBrowser()) return null;

  const rawUser = localStorage.getItem(AUTH_KEYS.user);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const isSessionValid = () => {
  const token = getStoredToken();
  const expiryMs = getStoredExpiryMs();

  return Boolean(token && expiryMs && expiryMs > Date.now());
};

export const getSafeReturnPath = (
  nextPath: string | null | undefined,
  fallback = '/admin/dashboard',
) => {
  if (!nextPath) return fallback;
  if (!nextPath.startsWith('/') || nextPath.startsWith('//')) return fallback;
  if (nextPath === '/login') return fallback;

  return nextPath;
};

const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (!isBrowser()) return;

  document.cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    'path=/',
    `max-age=${maxAgeSeconds}`,
    'samesite=lax',
  ].join('; ');
};

const deleteCookie = (name: string) => {
  if (!isBrowser()) return;

  document.cookie = [
    `${encodeURIComponent(name)}=`,
    'path=/',
    'max-age=0',
    'samesite=lax',
  ].join('; ');
};

export const saveAuthSession = ({
  token,
  expiryMs,
  user,
}: {
  token: string;
  expiryMs: number;
  user?: unknown;
}) => {
  if (!isBrowser()) return;

  localStorage.setItem(AUTH_KEYS.token, token);
  localStorage.setItem(AUTH_KEYS.expiry, String(expiryMs));

  if (user) {
    localStorage.setItem(AUTH_KEYS.user, JSON.stringify(user));
  }

  const maxAgeSeconds = Math.max(1, Math.floor((expiryMs - Date.now()) / 1000));
  setCookie(AUTH_KEYS.token, token, maxAgeSeconds);
  setCookie(AUTH_KEYS.expiry, String(expiryMs), maxAgeSeconds);
};

export const clearAuthSession = () => {
  if (!isBrowser()) return;

  localStorage.removeItem(AUTH_KEYS.token);
  localStorage.removeItem(AUTH_KEYS.expiry);
  localStorage.removeItem(AUTH_KEYS.user);

  deleteCookie(AUTH_KEYS.token);
  deleteCookie(AUTH_KEYS.expiry);
};

export const parseCookieExpiryMs = (
  tokenExpiry: string | null | undefined,
  token?: string | null,
) => normalizeExpiryMs(tokenExpiry, token);
