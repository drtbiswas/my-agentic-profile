# A2A and MCP client and server libraries

NOTE: This is not a full implementation of MCP and A2A, but instead a "lite" version 
for local testing and experimentation.  This code allows you to experiement with different
features and see the data flowing between clients and the server.


## Prerequisites

- Node.js v22.10.0 or higher
- npm v10.28.1 or higher    
- A Google AI Studio API key from https://aistudio.google.com/api-keys
   Add this key to the .env file, such as

    ```
    GEMINI_API_KEY=your-api-key
    ```
- Git


## Install this repo for local testing

```bash
git clone git@github.com:agentic-profile/agentic-profile-a2a-mcp-express.git
```


## Local A2A Testing

1. Start the A2A and MCP services

```bash
npm install
npm run dev
```

2. In a separate terminal, start the A2A client

```bash
npm run chat
```

3. For verbose debug output, add the -v flag

```bash
npm run chat -- --v true
```


## Local MCP Testing

1. Start the A2A and MCP services

```bash
npm install
npm run dev
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
