import { v4 as uuidv4 } from 'uuid';
import {
    AgentExecutor,
    RequestContext,
    ExecutionEventBus,
} from "@a2a-js/sdk/server";
import { Message } from '@a2a-js/sdk';
import { AgentMessageEnvelope, parseDid } from '@agentic-profile/common';

import { resolveSession } from '../../../src/a2a-service/handle-a2a-request.js';
//import { pickRandomWelcomeMessage } from './random-hello.js';
import { discoverSynergy } from './discover-synergy.js';

export class A2AServiceHandler implements AgentExecutor {
    public cancelTask = async (
        taskId: string,
        _eventBus: ExecutionEventBus
    ): Promise<void> => {
        console.log(`VentureExecutor:cancelTask is not supported: ${taskId}`);
    };

    async execute(
        requestContext: RequestContext,
        eventBus: ExecutionEventBus
    ): Promise<void> {
        // A2A message and session
        const { userMessage } = requestContext;
        const session = resolveSession(requestContext);
        const fromAgentDid = session?.agentDid ?? "unknown";  // might or might not include fragment...

        // open envelope for multi-tenancy support
        const envelope = userMessage.metadata?.envelope as AgentMessageEnvelope | undefined;
        const toAgentDid = envelope?.to;
        if (!toAgentDid)
            throw new Error("Message envelope is missing recipient agent did ('to' property)");
        const { fragment: toFragment } = parseDid(toAgentDid);
        if (!toFragment)
            throw new Error("Invalid toAgentDid, missing fragment: " + toAgentDid);
        if (toFragment !== "venture")
            throw new Error("Invalid toAgentDid, fragment is not 'venture': " + toAgentDid);

        //const text = session ? pickRandomWelcomeMessage() : "Please authenticate, and I will say hello :)";
        const { text, metadata, contextId } = await discoverSynergy({toAgentDid, fromAgentDid, userMessage});

        const agentMessage: Message = {
            kind: "message",
            contextId,
            messageId: uuidv4(),
            role: "agent",
            parts: [
                {
                    kind: "text",
                    text
                }
            ],
            metadata
        };

        eventBus.publish(agentMessage);
        eventBus.finished();
    }
}
