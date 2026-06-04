import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { retain } from '../../client.js';
import { jsonContent, errorContent } from '../../format.js';

export function registerGetAtRiskCustomers(server: McpServer) {
  server.registerTool(
    'get_at_risk_customers',
    {
      title: 'Get at-risk customers',
      description:
        'List customers by churn risk level, ordered by MRR at risk. Use to answer "which customers are at critical/high risk?".',
      inputSchema: {
        risk_level: z
          .array(z.enum(['Critical', 'High', 'Stable', 'Healthy']))
          .optional()
          .describe('Risk levels to include. Omit for Critical + High.'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe('Maximum number of customers to return (default 20).'),
      },
    },
    async ({ risk_level, limit }) => {
      try {
        const params = new URLSearchParams();
        if (risk_level && risk_level.length > 0) {
          params.set('risk_level', risk_level.join(','));
        }
        if (limit) {
          params.set('limit', String(limit));
        }
        const query = params.toString();
        const data = await retain.get(
          `/agent/customers/at-risk${query ? `?${query}` : ''}`
        );
        return jsonContent(data);
      } catch (error) {
        return errorContent(error);
      }
    }
  );
}
