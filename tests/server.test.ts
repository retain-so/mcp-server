import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createServer } from '../src/server';

type TextContent = { type: string; text: string };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function firstText(result: { content: unknown }): string {
  return (result.content as TextContent[])[0].text;
}

async function connectClient(): Promise<Client> {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const server = createServer();
  const client = new Client({ name: 'test-client', version: '0.0.0' });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return client;
}

describe('Retain MCP server', () => {
  beforeEach(() => {
    vi.stubEnv('RETAIN_API_KEY', 'rk_agent_test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('registers all eight tools', async () => {
    const client = await connectClient();
    const { tools } = await client.listTools();

    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'add_customer_note',
      'archive_alert',
      'get_active_alerts',
      'get_at_risk_customers',
      'get_churn_metrics',
      'get_customer_details',
      'get_mrr_at_risk',
      'mark_alert_contacted',
    ]);
  });

  it('returns the API payload as text content', async () => {
    const payload = {
      total_monthly_recurring_revenue_at_risk: 4200,
      active_alerts_by_risk_level: {
        Critical: 2,
        High: 1,
        Stable: 0,
        Healthy: 0,
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(payload)));

    const client = await connectClient();
    const result = await client.callTool({
      name: 'get_mrr_at_risk',
      arguments: {},
    });

    expect(JSON.parse(firstText(result))).toEqual(payload);
  });

  it('passes risk_level and limit as query params', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ customers: [] }));
    vi.stubGlobal('fetch', fetchMock);

    const client = await connectClient();
    await client.callTool({
      name: 'get_at_risk_customers',
      arguments: { risk_level: ['Critical', 'High'], limit: 5 },
    });

    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain('/agent/customers/at-risk?');
    expect(url).toContain('risk_level=Critical%2CHigh');
    expect(url).toContain('limit=5');
  });

  it('POSTs to the alert contacted endpoint', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ outreach_state: 'contacted', last_contacted_at: null }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const client = await connectClient();
    await client.callTool({
      name: 'mark_alert_contacted',
      arguments: { alert_id: 'a1' },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.retain.so/agent/alerts/a1/contacted');
    expect(init.method).toBe('POST');
  });

  it('surfaces API errors as tool errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'boom' }, 500)),
    );

    const client = await connectClient();
    const result = await client.callTool({
      name: 'get_active_alerts',
      arguments: {},
    });

    expect(result.isError).toBe(true);
    expect(firstText(result)).toContain('boom');
  });
});
