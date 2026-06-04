import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { retain } from '../../client.js';
import { jsonContent, errorContent } from '../../format.js';

export function registerAddCustomerNote(server: McpServer) {
  server.registerTool(
    'add_customer_note',
    {
      title: 'Add customer note',
      description:
        "Add a note to a customer's active alert — useful to document outreach done outside Retain. Requires a read+write agent key.",
      inputSchema: {
        customer_id: z.string().describe('Customer id (UUID).'),
        content: z.string().min(1).describe('Note text.'),
      },
    },
    async ({ customer_id, content }) => {
      try {
        const data = await retain.post(
          `/agent/customers/${encodeURIComponent(customer_id)}/notes`,
          { content }
        );
        return jsonContent(data);
      } catch (error) {
        return errorContent(error);
      }
    }
  );
}
