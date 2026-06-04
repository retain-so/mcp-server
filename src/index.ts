#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerGetAtRiskCustomers } from './tools/read/get-at-risk-customers.js';
import { registerGetCustomerDetails } from './tools/read/get-customer-details.js';
import { registerGetMrrAtRisk } from './tools/read/get-mrr-at-risk.js';
import { registerGetActiveAlerts } from './tools/read/get-active-alerts.js';
import { registerGetChurnMetrics } from './tools/read/get-churn-metrics.js';
import { registerAddCustomerNote } from './tools/write/add-customer-note.js';
import { registerMarkAlertContacted } from './tools/write/mark-alert-contacted.js';
import { registerArchiveAlert } from './tools/write/archive-alert.js';

const server = new McpServer({
  name: 'retain',
  version: '0.1.0',
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error starting Retain MCP server:', error);
  process.exit(1);
});
