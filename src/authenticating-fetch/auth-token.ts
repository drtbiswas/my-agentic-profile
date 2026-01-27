import { AgenticChallenge } from '@agentic-profile/auth';

export type AuthTokenResolver = (challenge: AgenticChallenge) => Promise<string>;

// Should not be shared between users/identities
export interface AuthTokenCache {
    cacheAuthToken: (url: string, authToken: string) => Promise<void>;
    getAuthToken: (url: string) => Promise<string | null>;
    deleteAuthToken: (url: string) => Promise<void>;
}

export function createInMemoryAuthTokenCache(): AuthTokenCache {
    const cache: Record<string, string> = {};
    return {
        cacheAuthToken: async (url: string, authToken: string) => {
            cache[url] = authToken;
        },
        getAuthToken: async (url: string) => cache[url] || null,
        deleteAuthToken: async (url: string) => { delete cache[url] }
    };
}
