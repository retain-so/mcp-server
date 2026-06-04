import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { retain } from '../../client.js';
import { jsonContent, errorContent } from '../../format.js';

export function registerGetChurnMetrics(server: McpServer) {
  server.registerTool(
    'get_churn_metrics',
    {
      title: 'Get churn metrics',
      description:
        'Consolidated metrics for the current period: churn rate, MRR churned, new/expansion/contraction MRR and net revenue retention.',
      inputSchema: {},
    },
    async () => {
      try {
        const data = await retain.get('/agent/metrics/churn');
        return jsonContent(data);
      } catch (error) {
        return errorContent(error);
      }
    }
  );
}
