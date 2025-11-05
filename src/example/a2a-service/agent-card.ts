import { AgentCardProps } from '../../a2a/types.js';

export function agentCard({url}: AgentCardProps) {
    return {
        name: 'Friendly Chatbot',
        description: 'An agent says friendly things',
        url, 
        provider: {
            organization: 'Agent World Congress',
            url: 'https://agentworldcongress.org'
        },
        version: '0.0.2', // Incremented version
        capabilities: {
            streaming: false, // The new framework supports streaming
            pushNotifications: false, // Assuming not implemented for this agent yet
            stateTransitionHistory: false, // Agent uses history
        },
        // authentication: null, // Property 'authentication' does not exist on type 'AgentCard'.
        securitySchemes: undefined, // Or define actual security schemes if any
        security: undefined,
        defaultInputModes: ['text'],
        defaultOutputModes: ['text', 'task-status'], // task-status is a common output mode
        skills: [
            {
                id: 'say_hello',
                name: 'Say Hello',
                description: 'Say hello to the user',
                tags: ['friendly', 'chat'],
                examples: [
                    'Say hello to the user',
                ],
                inputModes: ['text'],
                outputModes: ['text']
            },
        ],
        supportsAuthenticatedExtendedCard: false,
    };
}