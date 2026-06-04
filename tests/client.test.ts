import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { retain } from '../src/client';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('retain client', () => {
  beforeEach(() => {
    vi.stubEnv('RETAIN_API_KEY', 'rk_agent_test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends GET with bearer auth to the default base url', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const data = await retain.get('/agent/mrr-at-risk');

    expect(data).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.retain.so/agent/mrr-at-risk');
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe('Bearer rk_agent_test');
    expect(init.body).toBeUndefined();
  });

  it('honours RETAIN_API_URL and strips a trailing slash', async () => {
    vi.stubEnv('RETAIN_API_URL', 'http://localhost:3333/');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await retain.get('/agent/alerts');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://localhost:3333/agent/alerts',
    );
  });

  it('serialises the POST body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await retain.post('/agent/customers/c1/notes', { content: 'hi' });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ content: 'hi' }));
  });

  it('throws a readable error using the API message', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: 'nope' }, 403));
    vi.stubGlobal('fetch', fetchMock);

    await expect(retain.get('/agent/alerts')).rejects.toThrow(
      'Retain API error (403): nope',
    );
  });

  it('throws before fetching when RETAIN_API_KEY is missing', async () => {
    vi.stubEnv('RETAIN_API_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(retain.get('/agent/alerts')).rejects.toThrow(
      'RETAIN_API_KEY is not set',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
