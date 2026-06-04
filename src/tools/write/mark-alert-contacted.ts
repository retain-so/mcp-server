import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { retain } from '../../client.js';
import { errorContent, jsonContent } from '../../format.js';

export function registerMarkAlertContacted(server: McpServer) {
  server.registerTool(
    'mark_alert_contacted',
    {
      title: 'Mark alert as contacted',
      description:
        'Advance an alert to the "contacted" outreach state with a timestamp. Requires a read+write agent key.',
      inputSchema: {
        alert_id: z.string().describe('Alert id (UUID).'),
      },
    },
    async ({ alert_id }) => {
      try {
        const data = await retain.post(
          `/agent/alerts/${encodeURIComponent(alert_id)}/contacted`,
        );
        return jsonContent(data);
      } catch (error) {
        return errorContent(error);
      }
    },
  );
}
