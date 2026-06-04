import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { retain } from '../../client.js';
import { errorContent, jsonContent } from '../../format.js';

export function registerMarkAlertContacted(server: McpServer) {
  server.registerTool(
    'mark_alert_contacted',
    {
      title: 'Mark alerts as contacted',
      description:
        'Advance one or more alerts to the "contacted" outreach state with a timestamp. Pass a single id to mark one alert, or several to mark them in one call. Requires a read+write agent key.',
      inputSchema: {
        alert_ids: z
          .array(z.string())
          .min(1)
          .max(100)
          .describe('Alert ids (UUIDs). Pass one or many, up to 100.'),
      },
    },
    async ({ alert_ids }) => {
      try {
        const data = await retain.post('/agent/alerts/contacted', {
          alert_ids,
        });
        return jsonContent(data);
      } catch (error) {
        return errorContent(error);
      }
    },
  );
}
