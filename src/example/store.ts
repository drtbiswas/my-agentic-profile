import { ClientAgentSession, ClientAgentSessionStore, ClientAgentSessionUpdates } from '@agentic-profile/auth';

export function createClientAgentSessionStore(): ClientAgentSessionStore {

    const store = new Map<number, ClientAgentSession>();
    let nextId = 1;

    return {
        createClientAgentSession: async ( challenge: string ) => {
            const id = nextId++;
            store.set(id, {
                id,
                challenge,
                created: new Date(),
                agentDid: '',
                authToken: ''
            });
            return id;
        },
        fetchClientAgentSession: async ( id: number ) => {
            return store.get(id);
        },
        updateClientAgentSession: async ( id: number, updates: ClientAgentSessionUpdates ) => {
            const session = store.get(id);
            if (!session)
                throw new Error(`Session not found for id: ${id}`);
            store.set(id,{...session,...updates});
        }
    }
}
