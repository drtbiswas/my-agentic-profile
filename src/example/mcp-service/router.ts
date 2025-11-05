import { Router } from 'express';
import { handleToolsCall } from './methods.js';
import { MCP_TOOLS } from './tools.js';
import { DEFAULT_MCP_INITIALIZE_RESPONSE } from '../../mcp/misc.js';
import { ClientAgentSessionStore } from '@agentic-profile/auth';
import { createMcpRouter } from '../../mcp/mcp-router.js';
import { Resolver } from 'did-resolver';


export function createPresenceRouter( store: ClientAgentSessionStore, didResolver: Resolver ): Router {

    const constantResults = {
        initialize: INITIALIZE_RESPONSE,
        toolsList: { tools: MCP_TOOLS }
    };

    return createMcpRouter( store, didResolver, handleToolsCall, constantResults, { toolsRequireSession: false } );
}

const INITIALIZE_RESPONSE = {
    ...DEFAULT_MCP_INITIALIZE_RESPONSE,
    "serverInfo": {
        "name": "Presence Service",
        "title": "Find nearby people",
        "version": "1.0.0"
    }
};
