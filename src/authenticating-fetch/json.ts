import { authenticatingFetch, AuthenticatingFetchContext, RequestBody } from "./authenticating-fetch.js";


export async function postJson( url: string, body: RequestBody, context: AuthenticatingFetchContext, requestInit?: RequestInit ) {
    return await fetchJson(url, 'POST', body, context, requestInit);
}

export async function fetchJson( url: string, method: string, body: RequestBody, context: AuthenticatingFetchContext, requestInit: RequestInit = {} ) {
    requestInit.method = method;
    requestInit.headers = new Headers(requestInit.headers ?? {});
    requestInit.headers.set('Content-Type', 'application/json');

    context.body = body;

    const response = await authenticatingFetch( url, context, requestInit );
    return parseResponse(response);
}

export interface FetchResult {
    fetchResponse: Response;
    data: object | undefined;
}

async function parseResponse(fetchResponse: Response): Promise<FetchResult> {
    const headers = fetchResponse.headers;
    if (headers.get('Content-Type')?.includes('application/json') != true)
        return { fetchResponse, data: undefined };

    const data = await fetchResponse.json() as object;
    return { fetchResponse, data };
}
