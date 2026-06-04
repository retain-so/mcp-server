import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { retain } from '../../client.js';
import { jsonContent, errorContent } from '../../format.js';

export function registerGetActiveAlerts(server: McpServer) {
  server.registerTool(
    'get_active_alerts',
    {
      title: 'Get active alerts',
      description:
        'List active (non-archived) alerts ordered by priority, with customer, risk factors, MRR at risk and outreach state.',
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe('Maximum number of alerts to return (default 20).'),
      },
    },
    async ({ limit }) => {
      try {
        const query = limit ? `?limit=${limit}` : '';
        const data = await retain.get(`/agent/alerts${query}`);
        return jsonContent(data);
      } catch (error) {
        return errorContent(error);
      }
    }
  );
}
