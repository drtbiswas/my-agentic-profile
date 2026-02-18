import { authenticatingFetch, AuthenticatingFetchContext, RequestBody } from "./authenticating-fetch.js";

export async function fetchJson( url: string, method: string, body: RequestBody | undefined, context: AuthenticatingFetchContext, requestInit: RequestInit = {} ) {
    requestInit.method = method;
    requestInit.headers = new Headers(requestInit.headers ?? {});
    requestInit.headers.set('Content-Type', 'application/json');

    if( body )
        context.body = body;

    const response = await authenticatingFetch( url, context, requestInit );
    return parseResponse(response);
}

export interface JsonFetchResult {
    fetchResponse: Response;
    data: object | undefined;
}

async function parseResponse(fetchResponse: Response): Promise<JsonFetchResult> {
    const headers = fetchResponse.headers;
    if (headers.get('Content-Type')?.includes('application/json') != true)
        return { fetchResponse, data: undefined };

    const data = await fetchResponse.json() as object;
    return { fetchResponse, data };
}
