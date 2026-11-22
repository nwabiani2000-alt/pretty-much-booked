import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Base URL for the Next.js web API (`/api/auth/*`, payments, etc.).
 * Override with EXPO_PUBLIC_API_URL (e.g. http://127.0.0.1:3000).
 */
export function getApiBaseUrl(): string {
  const fromEnv =
    process.env.EXPO_PUBLIC_API_URL ||
    (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  // Expo web in this monorepo talks to the local Next server.
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      const { hostname } = window.location;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://127.0.0.1:3000';
      }
    }
    return 'http://127.0.0.1:3000';
  }

  // Native simulators / Expo Go on host machine
  return 'http://127.0.0.1:3000';
}

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
}
