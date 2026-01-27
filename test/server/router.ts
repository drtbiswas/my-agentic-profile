import express from 'express';
import cors from 'cors';
import type { Request, Response, NextFunction, Application } from 'express';
import { createDidResolver, InMemoryAgenticProfileStore } from '@agentic-profile/common';
import { createClientAgentSessionStore } from './store.js';


// A2A handlers and helpers
import { A2AServiceHandler, agentCard } from './a2a-service/index.js';
import { createA2AServiceRouter } from '../../src/a2a-service/router.js';

// MCP handlers
import { createPresenceRouter } from "./mcp-service/router.js";

// Authentication/session handlers
const sessionStore = createClientAgentSessionStore();
const profileStore = new InMemoryAgenticProfileStore();
const didResolver = createDidResolver({ store: profileStore });

// Create Express app
const app: Application = express();

// Trust proxy for accurate req.protocol when behind reverse proxy (e.g., AWS API Gateway)
app.set('trust proxy', true);

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'mcp-protocol-version',
        'Content-Type',
        'Authorization',
        'WWW-Authenticate',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'Pragma'
    ],
    exposedHeaders: [
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Origin',
        'WWW-Authenticate'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware to log HTTP method and path
app.use((req, _res, next) => {
    console.log(`Starting ${req.method} ${req.path}`); //, req.body);
    next();
});

// Health check endpoint
const started = new Date().toISOString();
app.get('/status', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        started,
        timestamp: new Date().toISOString(),
        service: 'a2a-mcp-express',
        url: req.originalUrl
    });
});

/* Well known did.json
app.get('/.well-known/did.json', (req: Request, res: Response) => {
    wellKnownDidDocument.id = `did:web:${req.get('host')}`;
    res.json(wellKnownDidDocument);
});
*/


app.use('/a2a/hello', createA2AServiceRouter({
    executor: new A2AServiceHandler(),
    cardBuilder: agentCard,
    store: sessionStore,
    didResolver,
    requireAuth: true
}));
app.use('/mcp/presence', createPresenceRouter(sessionStore, didResolver));

// Serve the web interface for non-API routes
app.get('/', (_req: Request, res: Response) => {
    res.sendFile('index.html', { root: 'www' });
});

// Serve static files from www directory (after specific routes)
app.use(express.static('www'));

// Error handling middleware
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        jsonrpc: '2.0',
        id: 'unhandled-error',
        error: {
            code: -32603,
            message: 'Internal error',
            data: error.message
        }
    });
});

export { app }; 
