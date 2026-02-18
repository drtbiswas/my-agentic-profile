import { Router, Request, Response } from 'express';
import { Resolver } from 'did-resolver';
import { AgentExecutor } from '@a2a-js/sdk/server';
import { ClientAgentSessionStore } from '@agentic-profile/auth';
import { AgentCardBuilder } from './types.js';
import { createAuthenticatingExpressRequestHandler } from '../json-rpc-service/auth.js';
import { createA2AExecutorHandler } from './executor-handler.js';
import { JsonRpcRequestHandler } from '../json-rpc-service/index.js';

export type A2AExecutorRouterParams = {
    executor: AgentExecutor;
    cardBuilder: AgentCardBuilder;
    store: ClientAgentSessionStore;
    didResolver: Resolver;
    requireAuth?: boolean;
}

export function createA2AExecutorRouter({ executor, cardBuilder, store, didResolver, requireAuth = true}: A2AExecutorRouterParams): Router {
    const router = Router();

    const authenticatingRequestHandler = createAuthenticatingExpressRequestHandler(store, didResolver);
    const a2aRequestHandler = createA2AExecutorHandler(executor, requireAuth);

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

export type A2ALiteRouterParams = {
    jrpcRequestHandler: JsonRpcRequestHandler;
    cardBuilder: AgentCardBuilder;
    store: ClientAgentSessionStore;
    didResolver: Resolver;
    requireAuth?: boolean;
}

export function createA2ALiteRouter({ jrpcRequestHandler, cardBuilder, store, didResolver}: A2ALiteRouterParams): Router {
    const router = Router();

    const authenticatingRequestHandler = createAuthenticatingExpressRequestHandler(store, didResolver);

    router.get('/agent-card.json', async (req: Request, res: Response) => {
        const url = req.protocol + '://' + req.get('host') + req.originalUrl.replace(/\/agent-card\.json$/, '');
        const agentCard = cardBuilder({ url });

        res.json(agentCard);
    });

    router.post('/', async (req: Request, res: Response) => {
        authenticatingRequestHandler(req, res, jrpcRequestHandler);
    });

    return router;
}
