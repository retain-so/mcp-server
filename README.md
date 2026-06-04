# Retain MCP Server

Let your AI agent see who is about to churn, and do something about it.

`@retain/mcp-server` connects [Retain](https://retain.so) to any MCP client (Claude Code, Claude Desktop, Cursor, Windsurf, and friends). Ask in plain English which customers are at risk, pull a customer's full health profile, check MRR at risk, and log outreach, all without opening the dashboard.

Retain is an AI-first churn prevention and customer analytics platform. This server is the bridge between your agent and your Retain data.

## What you can ask your agent to do

Read:

- "Which customers are at critical risk this week?"
- "Show me my high-risk customers ordered by MRR."
- "What's my total MRR at risk, broken down by risk level?"
- "Pull the full profile for Acme Inc."
- "List the active alerts I haven't contacted yet."
- "Summarize this month's churn metrics and net revenue retention."

Act (needs a read+write key):

- "Add a note to Acme: reached out today."
- "Mark the alert for Globex as contacted."
- "Archive the resolved alert for Initech."

## Setup (under 5 minutes)

1. In Retain, go to **Settings → Agent keys** and create a key. Pick **read** for query-only, or **read & write** to let the agent take actions. Copy it (it is shown once).
2. Add the snippet for your client below.
3. Restart the client and ask your first question.

### Claude Code

```bash
claude mcp add retain --env RETAIN_API_KEY=rk_agent_xxx -- npx -y @retain/mcp-server
```

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "retain": {
      "command": "npx",
      "args": ["-y", "@retain/mcp-server"],
      "env": { "RETAIN_API_KEY": "rk_agent_xxx" }
    }
  }
}
```

### Cursor / Windsurf (`.cursor/mcp.json` or `~/.codeium/windsurf/mcp_config.json`)

```json
{
  "mcpServers": {
    "retain": {
      "command": "npx",
      "args": ["-y", "@retain/mcp-server"],
      "env": { "RETAIN_API_KEY": "rk_agent_xxx" }
    }
  }
}
```

## Tools

| Tool | Type | What it does |
|------|------|--------------|
| `get_at_risk_customers` | read | Customers by churn risk (`Critical`/`High`/`Stable`/`Healthy`), ordered by MRR. Defaults to Critical + High. |
| `get_customer_details` | read | Full profile for one customer by id or name. |
| `get_mrr_at_risk` | read | Total MRR at risk plus active-alert counts by risk level. |
| `get_active_alerts` | read | Active alerts by priority, with risk factors and outreach state. |
| `get_churn_metrics` | read | Churn rate, MRR churned, expansion/contraction, net revenue retention. |
| `add_customer_note` | write | Add a note to a customer's active alert. |
| `mark_alert_contacted` | write | Mark an alert as contacted. |
| `archive_alert` | write | Archive a resolved alert. |

Coming soon: `send_retention_email` (trigger a templated retention email).

## Example conversation

> **You:** Who's about to churn and how much money is on the line?
>
> **Agent:** *(calls `get_mrr_at_risk`, then `get_at_risk_customers`)* You have $4,200 MRR at risk across 7 active alerts. The two biggest are Acme Inc ($900, critical, 18 days inactive) and Globex ($650, high).
>
> **You:** Note that I emailed Acme today and mark their alert as contacted.
>
> **Agent:** *(calls `add_customer_note` and `mark_alert_contacted`)* Done. Logged the note on Acme and moved the alert to contacted.

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RETAIN_API_KEY` | yes | — | Agent key from Settings → Agent keys. |
| `RETAIN_API_URL` | no | `https://api.retain.so` | Override the API base URL (self-host / staging). |

## Development

```bash
npm install
npm run dev        # run from source with tsx
npm run build      # bundle to dist/
npm run typecheck
```

The server holds no business logic and no database. It only translates MCP tool calls into HTTP requests against Retain's public `/agent/*` API. Contributions and new tools are welcome.

## License

MIT
