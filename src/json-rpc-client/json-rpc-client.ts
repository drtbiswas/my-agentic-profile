import { AuthenticatingFetchContext } from '../authenticating-fetch/authenticating-fetch.js';
import { FetchResult, postJson } from '../authenticating-fetch/json.js';

type RpcBody = string | object;

export async function sendJsonRpcRequest( url: string, rpcBody: RpcBody, authContext: AuthenticatingFetchContext, requestInit?: RequestInit ): Promise<FetchResult> {
    const body = asJsonRpcBody(rpcBody);
    return await postJson(url, body, authContext, requestInit);
}

// ensure required JSON RPC headers are present
function asJsonRpcBody(rpcBody: RpcBody): string {
    const body = typeof rpcBody === 'string' ? JSON.parse(rpcBody) : rpcBody;

    return JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now().toString(),
        ...body
    }, null, 4);
}
