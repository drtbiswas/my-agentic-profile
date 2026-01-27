import { ClientAgentSession } from "@agentic-profile/auth";
import { Request, Response } from 'express';
import { JsonRpcRequest, JsonRpcResponse } from '../json-rpc-client/types.js';

export const AGENTIC_AUTH_REQUIRED_JSON_RPC_CODE = -13000;

export type JsonRpcRequestContext = {
    session?: ClientAgentSession | undefined;
    req: Request;
}

export type JsonRpcRequestHandler = (jrpcRequest: JsonRpcRequest, context: JsonRpcRequestContext) => Promise<JsonRpcResponse | null>;
export type ExpressRequestHandler = (req: Request, res: Response, jrpcRequestHandler: JsonRpcRequestHandler) => Promise<void>;
