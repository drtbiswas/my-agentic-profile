import { Router, Request, Response } from 'express';
import { JSONRPCRequest } from '@modelcontextprotocol/sdk/types.js';
import { ClientAgentSession,ClientAgentSessionStore } from '@agentic-profile/auth';
import { Resolver } from 'did-resolver';

import { jrpcErrorAuthRequired, JsonRpcRequest, JsonRpcResponse, jrpcResult } from '../json-rpc/index.js';
import { handleMcpGet, handleMcpDelete } from './mcp-stream.js';
import { createAuthenticatingExpressRequestHandler } from '../json-rpc/auth.js';
import { ConstantMcpResults } from './type.js';


export interface CreateMcpRouterOptions {
    toolsRequireSession?: boolean
}

export function createMcpRouter( store: ClientAgentSessionStore, didResolver: Resolver, handleToolsCall: any, constantResults: ConstantMcpResults, options: CreateMcpRouterOptions  = {}): Router {

    const router = Router();
    const authenticatingRequestHandler = createAuthenticatingExpressRequestHandler(store, didResolver);

    async function handleMcpRequest(req: Request, res: Response) {
        await authenticatingRequestHandler( req, res, async ( jrpcRequest: JsonRpcRequest, session: ClientAgentSession | null ): Promise<JsonRpcResponse | null> => {
            const requestId = jrpcRequest.id!;  // might be null
            switch( jrpcRequest.method ) {
                case 'initialize':
                    return jrpcResult(requestId, constantResults.initialize );
                case 'notifications/initialized':
                    return jrpcResult(requestId, {} );
                case 'logging/setLevel':
                    return jrpcResult(requestId, {} );
                case 'tools/list':
                    return jrpcResult(requestId, constantResults.toolsList );
                case 'tools/call':
                    if( options.toolsRequireSession !== false && !session )
                        return jrpcErrorAuthRequired( requestId );
                    else
                        return await handleToolsCall( jrpcRequest as JSONRPCRequest, session, req );
                default:
                    return null;
            }
        });
    }

    router.post('/', handleMcpRequest);
    router.get('/', handleMcpGet);
    router.delete('/', handleMcpDelete);

    return router;
}
