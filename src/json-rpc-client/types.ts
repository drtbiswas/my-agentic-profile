/**
 * Both A2A and MCP have their own opinionated variations of the JSON RPC schema.
 * The generic JsonRpcRequest and JsonRpcResponse types are designed to be interchangable so
 * requests can be safely typed until they are handed off to the appropriate
 * MCP or A2A implementation handler.
 */

export type JsonRpcId = string | number | null | undefined;

export type JsonRpcRequest = {
    jsonrpc: "2.0";
    id: JsonRpcId;
    method: string;
    params: any;
}

export type JsonRpcResponse = {
    jsonrpc: "2.0";
    id: JsonRpcId;
} & (
        | { result: any; error?: never }
        | { result?: never; error: { code: number; message: string, data?: any } }
    )