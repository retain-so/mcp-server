import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { retain } from '../../client.js';
import { errorContent, jsonContent } from '../../format.js';

export function registerArchiveAlert(server: McpServer) {
  server.registerTool(
    'archive_alert',
    {
      title: 'Archive alert',
      description:
        'Archive a resolved alert, removing it from the attention queue. Requires a read+write agent key.',
      inputSchema: {
        alert_id: z.string().describe('Alert id (UUID).'),
        reason: z
          .string()
          .optional()
          .describe('Optional reason for archiving.'),
      },
    },
    async ({ alert_id, reason }) => {
      try {
        const data = await retain.post(
          `/agent/alerts/${encodeURIComponent(alert_id)}/archive`,
          reason ? { reason } : undefined,
        );
        return jsonContent(data);
      } catch (error) {
        return errorContent(error);
      }
    },
  );
}
