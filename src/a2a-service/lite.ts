import { JsonRpcRequest, JsonRpcResponse } from "../json-rpc-client/types.js";
import { jrpcError } from "../json-rpc-service/utils.js";

/**
 * Ensure the JSON-RPC request method is valid and return the method and params.
 * @param jrpcRequest - The JSON-RPC request.
 * @param methods - The allowed methods.
 * @returns The method and params.
 */
export function checkJrpcMethod( jrpcRequest: JsonRpcRequest, methods: string[] ): JsonRpcResponse | undefined {
    const { jsonrpc, id, method } = jrpcRequest;
    if (jsonrpc !== '2.0')
        return jrpcError(id, -32600, 'Invalid JSON-RPC version');
    if (!methods.includes(method))
        return jrpcError(id, -32600, `Invalid method '${method}; only ${methods.join()} is supported`);

    return undefined;
}