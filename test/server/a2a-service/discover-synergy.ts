import { GoogleGenAI } from '@google/genai';
import { Message } from '@a2a-js/sdk';
import dotenv from 'dotenv';
dotenv.config(); // Ugh, duplicate to avoid ESM race conditions

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY)
    throw new Error("GEMINI_API_KEY is not set");
const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

interface DiscoverSynergyParams {
    toAgentDid: string;
    fromAgentDid: string;
    userMessage: Message;
}

export interface Result {
    text: string;
    metadata: any;
    contextId: string;
}

export async function discoverSynergy({toAgentDid, fromAgentDid, userMessage}: DiscoverSynergyParams): Promise<Result> {
    // resolve context
    const contextPrefix = `${toAgentDid}^${fromAgentDid}^`;
    let contextId;
    if (!userMessage.contextId)
        contextId = `${contextPrefix}${Date.now()}`;
    else {
        if (!userMessage.contextId.startsWith(contextPrefix))
            throw new Error("Context ID does not match agent IDs");
        contextId = userMessage.contextId;
    }
    
    return { text: "We have Synergy!", metadata: { resolution: { like: true } }, contextId }
}
