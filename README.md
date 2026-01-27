# A2A and MCP client and server libraries

## Local MCP Testing

1. Start the A2A and MCP services

```bash
pnpm install
pnpm dev
```

2. Start the MCP inspector

```bash
npx @modelcontextprotocol/inspector
```

3. From the MCP inspector running in your browser

- URL: http://localhost:4004/mcp/presence
- Transport Type: Streamable HTTP
- Connection Type: Direct

Then click the "Connect" button

4. 

## Local A2A Testing

1. Start the A2A and MCP services

```bash
pnpm install
pnpm dev
```

2. In a separate terminal, start the A2A client

```bash
pnpm chat
```
