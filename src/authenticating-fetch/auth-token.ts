import { AgenticChallenge } from '@agentic-profile/auth';

export type AuthTokenResolver = (challenge: AgenticChallenge) => Promise<string>;

// Should not be shared between users/identities
export interface AuthTokenCache {
    cacheAuthToken: (authToken: string) => Promise<void>;
    getAuthToken: () => Promise<string | null>;
    deleteAuthToken: () => Promise<void>;
}

export function createInMemoryAuthTokenCache(): AuthTokenCache {
    let cache: string | null = null;
    return {
        cacheAuthToken: async (authToken: string) => {
            cache = authToken;
        },
        getAuthToken: async () => cache,
        deleteAuthToken: async () => { cache = null }
    };
}
