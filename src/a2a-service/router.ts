import { Router, Request, Response } from 'express';
import { Resolver } from 'did-resolver';
import { AgentExecutor } from '@a2a-js/sdk/server';
import { ClientAgentSessionStore } from '@agentic-profile/auth';
import { AgentCardBuilder } from './types.js';
import { createAuthenticatingExpressRequestHandler } from '../json-rpc-service/auth.js';
import { createA2ARequestHandler } from './handle-a2a-request.js';

export type A2AServiceRouterParams = {
    executor: AgentExecutor;
    cardBuilder: AgentCardBuilder;
    store: ClientAgentSessionStore;
    didResolver: Resolver;
    requireAuth?: boolean;
}


export function createA2AServiceRouter({ executor, cardBuilder, store, didResolver, requireAuth = true}: A2AServiceRouterParams): Router {
    const router = Router();

    const authenticatingRequestHandler = createAuthenticatingExpressRequestHandler(store, didResolver);
    const a2aRequestHandler = createA2ARequestHandler(executor, requireAuth);

    router.get('/agent-card.json', async (req: Request, res: Response) => {
        const url = req.protocol + '://' + req.get('host') + req.originalUrl.replace(/\/agent-card\.json$/, '');
        const agentCard = cardBuilder({ url });

        res.json(agentCard);
    });

    router.post('/', async (req: Request, res: Response) => {
        authenticatingRequestHandler(req, res, a2aRequestHandler);
    });

    return router;
}
