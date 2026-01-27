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
import { AGENTIC_AUTH_REQUIRED_JSON_RPC_CODE, JsonRpcRequestHandler } from "./types.js";
import { JsonRpcRequest, JsonRpcResponse } from '../json-rpc-client/types.js';
import { prettyJson } from "@agentic-profile/common";
import log from 'loglevel';


export function createAuthenticatingExpressRequestHandler(clientAgentSessionStore: ClientAgentSessionStore, didResolver: Resolver): ExpressRequestHandler {
    return async (req: Request, res: Response, handleJsonRpcRequest: JsonRpcRequestHandler) => {
        try {
            log.trace('🔍 Authenticating request', typeof req.body, prettyJson(req.body));

            const jrpcRequest = req.body as JsonRpcRequest;
            const { id, method } = jrpcRequest;

            // Validate JSON-RPC request
            const requestError = describeJsonRpcRequestError(jrpcRequest);
            if (requestError) {
                log.debug('describeJsonRpcRequestError', prettyJson(req));
                res.status(400).json(jrpcError(id || 'unknown', -32600, requestError));
                return;
            }

            // Are they providing an agentic session?
            let session: ClientAgentSession | undefined;
            const { authorization } = req.headers;
            if (authorization)
                session = await handleAuthorization(authorization, clientAgentSessionStore, didResolver) ?? undefined;

            const result = await handleJsonRpcRequest(jrpcRequest, { session, req });
            if (result) {
                // Error?
                if ('error' in result) {
                    const { error } = result as JsonRpcResponse;
                    if (error?.code === AGENTIC_AUTH_REQUIRED_JSON_RPC_CODE) {
                        log.debug('🔍 Auth required, creating challenge');
                        const challenge = await createChallenge(clientAgentSessionStore);

                        res.status(401)
                            .set('WWW-Authenticate', `Agentic ${b64u.objectToBase64Url(challenge)}`)
                            .set('Access-Control-Expose-Headers', 'WWW-Authenticate')
                            .json(result);
                        return;
                    }

                    // Other errors...
                    const httpStatus = jsonRpcErrorCodeToHttpStatus(error?.code || 0);
                    log.debug(`🔍 Error code ${error?.code} => HTTP ${httpStatus}:`, prettyJson(result));
                    res.status(httpStatus).json(result);
                    return;
                }

                // Success response
                log.debug('🔍 Success result:', prettyJson(result));
                res.json(result); // Return response as-is with 200 status
            } else {
                log.debug('🔍 Result:', prettyJson(result));
                res.status(400).json(jrpcError(id!, -32601, `Method ${method} not found`));
            }
        } catch (error) {
            log.error('MCP method handler error:', prettyJson(error));
            res.status(500).json(jrpcError(req.body.id || 'unknown', -32603, `Internal error: ${error}`));
        }
    }
}

function jsonRpcErrorCodeToHttpStatus(code: number): number {
    if (code >= -32099 && code <= -32000)
        return 500;

    switch (code) {
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
