/** Wrap any JSON-serialisable value as MCP text content. */
export function jsonContent(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

/** Wrap an error as an MCP tool error result the agent can read. */
export function errorContent(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: 'text' as const, text: message }],
    isError: true,
  };
}
