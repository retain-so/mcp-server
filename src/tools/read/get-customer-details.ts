import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { retain } from '../../client.js';
import { jsonContent, errorContent } from '../../format.js';

export function registerGetCustomerDetails(server: McpServer) {
  server.registerTool(
    'get_customer_details',
    {
      title: 'Get customer details',
      description:
        'Get the full profile for one customer by id or name: plan, health score, risk level, seats, activity trend and recent alerts.',
      inputSchema: {
        customer: z
          .string()
          .describe('Customer id (UUID) or name to look up.'),
      },
    },
    async ({ customer }) => {
      try {
        const data = await retain.get(
          `/agent/customers/${encodeURIComponent(customer)}`
        );
        return jsonContent(data);
      } catch (error) {
        return errorContent(error);
      }
    }
  );
}
