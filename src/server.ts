import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerGetActiveAlerts } from './tools/read/get-active-alerts.js';
import { registerGetAtRiskCustomers } from './tools/read/get-at-risk-customers.js';
import { registerGetChurnMetrics } from './tools/read/get-churn-metrics.js';
import { registerGetCustomerDetails } from './tools/read/get-customer-details.js';
import { registerGetMrrAtRisk } from './tools/read/get-mrr-at-risk.js';
import { registerAddCustomerNote } from './tools/write/add-customer-note.js';
import { registerArchiveAlert } from './tools/write/archive-alert.js';
import { registerMarkAlertContacted } from './tools/write/mark-alert-contacted.js';

export const SERVER_NAME = 'retain';
export const SERVER_VERSION = '0.1.0';

/**
 * Build a fully-configured Retain MCP server with every tool registered.
 * Kept separate from the stdio entry point so it can be unit/integration
 * tested against an in-memory transport.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Read tools
  registerGetAtRiskCustomers(server);
  registerGetCustomerDetails(server);
  registerGetMrrAtRisk(server);
  registerGetActiveAlerts(server);
  registerGetChurnMetrics(server);

  // Action tools (require a read+write agent key)
  registerAddCustomerNote(server);
  registerMarkAlertContacted(server);
  registerArchiveAlert(server);

  return server;
}
