import { Router } from 'express';
import { handleToolsCall } from './methods.js';
import { MCP_TOOLS } from './tools.js';
import { DEFAULT_MCP_INITIALIZE_RESPONSE } from '../../../src/mcp-service/misc.js';
import { ClientAgentSessionStore } from '@agentic-profile/auth';
import { createMcpServiceRouter } from '../../../src/mcp-service/router.js';
import { Resolver } from 'did-resolver';


export function createPresenceRouter(store: ClientAgentSessionStore, didResolver: Resolver): Router {

    return createMcpServiceRouter({
        store,
        didResolver,
        handlers: { toolsCall: handleToolsCall },
        initializeResponse: INITIALIZE_RESPONSE,
        lists: { tools: MCP_TOOLS },
        //toolsRequireSession: false
    });
}

const INITIALIZE_RESPONSE = {
    ...DEFAULT_MCP_INITIALIZE_RESPONSE,
    "serverInfo": {
        "name": "Presence Service",
        "title": "Find nearby people",
        "version": "1.0.0"
    }
};
