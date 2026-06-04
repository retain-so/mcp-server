import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { retain } from '../../client.js';
import { jsonContent, errorContent } from '../../format.js';

export function registerGetMrrAtRisk(server: McpServer) {
  server.registerTool(
    'get_mrr_at_risk',
    {
      title: 'Get MRR at risk',
      description:
        'Total monthly recurring revenue at risk plus active-alert counts by risk level. A quick executive snapshot.',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await retain.get('/agent/mrr-at-risk');
        return jsonContent(data);
      } catch (error) {
        return errorContent(error);
      }
    }
  );
}
