import {
    b64u,
    ClientAgentSession,
    ClientAgentSessionStore,
    createChallenge,
    handleAuthorization
} from "@agentic-profile/auth";
import { Resolver } from 'did-resolver';
import { Request, Response } from 'express';
import { jrpcError, describeJsonRpcRequestError } from './utils.js';
import { ExpressRequestHandler } from './types.js';

/*import {
    clientAgentSessionStore,
    agenticProfileStore
} from '../stores/redis-store.js';
 */
import { AGENTIC_AUTH_REQUIRED_JSON_RPC_CODE, JsonRpcRequestHandler, JsonRpcRequest, JsonRpcResponse } from "./types.js";

export function createAuthenticatingExpressRequestHandler( clientAgentSessionStore: ClientAgentSessionStore, didResolver: Resolver): ExpressRequestHandler {
    return async (req: Request, res: Response, handleJsonRpcRequest: JsonRpcRequestHandler) => {
        try {
            const jrpcRequest = req.body as JsonRpcRequest;
            const { id, method } = jrpcRequest;
        
            // Validate JSON-RPC request
            const requestError = describeJsonRpcRequestError( jrpcRequest );
            if ( requestError ) {
                res.status(400).json( jrpcError( id || 'unknown', -32600, requestError ) );
                return;
            }

            // Are they providing an agentic session?
            let session: ClientAgentSession | null = null;
            const { authorization } = req.headers;
            if( authorization )
                session = await handleAuthorization( authorization, clientAgentSessionStore, didResolver );

            const result = await handleJsonRpcRequest( jrpcRequest, session, req );
            if( result ) {
                // Error?
                if( 'error' in result ) {
                    const { error } = result as JsonRpcResponse;
                    if( error?.code === AGENTIC_AUTH_REQUIRED_JSON_RPC_CODE ) {
                        console.log('🔍 Auth required, creating challenge');
                        const challenge = await createChallenge( clientAgentSessionStore );

                        res.status(401)
                            .set('WWW-Authenticate', `Agentic ${b64u.objectToBase64Url(challenge)}`)
                            .set('Access-Control-Expose-Headers', 'WWW-Authenticate')
                            .json(result);
                        return;
                    }

                    // Other errors...
                    const httpStatus = jsonRpcErrorCodeToHttpStatus(error?.code || 0);
                    console.log(`🔍 Error code ${error?.code} => HTTP ${httpStatus}:`, result);
                    res.status(httpStatus).json(result);
                    return;
                }

                // Success response
                console.log('🔍 Success result:', result);
                res.json(result); // Return response as-is with 200 status
            } else {
                console.log('🔍 Result:', result);
                res.status(400).json( jrpcError( id!, -32601, `Method ${method} not found` ) );
            }
        } catch (error) {
            console.error('MCP method handler error:', error);
            res.status(500).json( jrpcError( req.body.id || 'unknown', -32603, `Internal error: ${error}` ) );
        }
    }
}

function jsonRpcErrorCodeToHttpStatus(code: number): number {
    if( code >= -32099 && code <= -32000 )
        return 500;

    switch( code ) {
        case -32603:
            return 500; // Internal error
        case -32602:
            return 400; // Invalid params
        case -32601:
            return 400; // Method not found
        case -32600:
            return 400; // Invalid request  
        default:
            return 400;
    }
}