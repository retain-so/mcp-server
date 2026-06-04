/**
 * Thin HTTP client for the Retain agent API (`/agent/*`).
 * No business logic, just forwards requests with the agent key.
 */

const DEFAULT_API_URL = 'https://api.retain.so';

function baseUrl(): string {
  return (process.env.RETAIN_API_URL ?? DEFAULT_API_URL).replace(/\/$/, '');
}

function apiKey(): string {
  const key = process.env.RETAIN_API_KEY;
  if (!key) {
    throw new Error(
      'RETAIN_API_KEY is not set. Create an agent key in Retain (Settings → Agent keys) and add it to your MCP client config.',
    );
  }
  return key;
}

async function request<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const response = await fetch(`${baseUrl()}${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const text = await response.text();

  if (!response.ok) {
    let message = text;
    try {
      message = (JSON.parse(text) as { message?: string }).message ?? text;
    } catch {
      // keep raw text
    }
    throw new Error(`Retain API error (${response.status}): ${message}`);
  }

  return (text ? JSON.parse(text) : {}) as T;
}

export const retain = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body }),
};
