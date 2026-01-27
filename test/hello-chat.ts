import * as readline from 'node:readline/promises';
import os from "os";
import { stdin as input, stdout as output } from 'node:process';
import { prettyJson, parseDid } from "@agentic-profile/common";
import { join } from 'node:path';
import { loadProfileAndKeyring, saveProfile } from './local-files';
import { createProfile } from './create-profile';
import { sendJsonRpcRequest } from '../src/json-rpc-client/index';
import { AgenticChallenge, generateAuthToken, ProfileAndKeyring, ProfileAndKeyringResolver } from '@agentic-profile/auth';
import { createInMemoryAuthTokenCache } from '../src/authenticating-fetch/auth-token.js';
import { AuthTokenResolver, AuthTokenCache } from '../src/authenticating-fetch/auth-token.js';
import log from 'loglevel';


async function main() {

    const {
        host = 'http://localhost:4004/a2a/hello',
        profile: profileName = 'test-account',
        to = 'did:web:iamagentic.ai:1#venture',
        from,
        v
    } = parseArgv(['host', 'profile', 'to', 'from', 'v']);
    const isVerbose = !!v;

    console.log('--- A2A Chat Started ---');
    console.log(`Using A2A URL: ${host}`);

    if (isVerbose) {
        log.setLevel('debug');
        console.log(`Verbose mode enabled`);
    }

    const agentCard = await verifyAgentCard(host);
    if (isVerbose)
        console.log(`Agent Card: ${prettyJson(agentCard)}`);

    const rl = readline.createInterface({ input, output });
    const { profile, keyring, name } = await resolveProfile(profileName, rl) ?? {};

    let authTokenCache: AuthTokenCache | undefined = undefined;
    let authTokenResolver: AuthTokenResolver | undefined;
    if (profile && keyring) {
        let agentDid = profile.id;
        if (from) {
            const fragmentId = '#' + from;
            const agent = profile.service?.find(s => s.id === fragmentId);
            if (!agent)
                throw new Error(`No agent with id ${fragmentId} found in profile`);
            agentDid += fragmentId;
        }

        console.log(`From agent DID: ${agentDid}`);
        console.log(`  To agent DID: ${to}`);

        const profileResolver = createProfileAndKeyringResolver({ profile, keyring });
        authTokenResolver = async (agenticChallenge: AgenticChallenge) => {
            if(isVerbose)
                console.log('authTokenResolver() agenticChallenge', prettyJson(agenticChallenge));
            return await generateAuthToken({ agentDid, agenticChallenge, profileResolver });
        }
        authTokenCache = createInMemoryAuthTokenCache();
    } else {
        authTokenResolver = () => { throw new Error('No profile or keyring provided'); }
    }
    console.log('Type your message below. Type "exit" to end the chat.');

    try {
        while (true) {
            const answer = await rl.question('User: ');

            if (answer.toLowerCase() === 'exit') {
                console.log('Agent: Goodbye!');
                break;
            }

            const rpcBody = {
                jsonrpc: '2.0',
                id: Date.now().toString(),
                method: 'send/message',
                params: {
                    message: {
                        parts: [
                            {
                                kind: 'text',
                                text: answer
                            }
                        ],
                        metadata: {
                            envelope: {
                                to
                            }
                        }
                    }
                }
            };

            if(isVerbose)
                console.log('RPC Body:', prettyJson(rpcBody));

            try {
                const rpcResult = await sendJsonRpcRequest(
                    host,
                    rpcBody,
                    { authTokenResolver, authTokenCache }
                );
                if(isVerbose)
                    console.log('Fetch Result:', prettyJson(rpcResult));

                const message = rpcResult.data?.result;
                const text = message?.parts[0].text;
                console.log(`Agent: ${text}`);
            } catch (err) {
                console.error('An error occurred:', err);
            }
        }
    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        rl.close();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

// for each key, find the following value
function parseArgv(keys: string[]) {
    const argv: Record<string, string> = {};
    for (const key of keys) {
        const index = process.argv.indexOf(`--${key}`);
        if (index === -1 || index + 1 >= process.argv.length)
            continue;

        const value = process.argv[index + 1];
        if (value.startsWith('--'))
            continue;

        argv[key] = value
    }

    return argv;
}

async function verifyAgentCard(host: string) {

    if (!host.endsWith('/'))
        host += '/'; // ensure ends with a / so new URL() works

    const url = new URL(host);
    if (url.pathname === '')
        host = new URL('/well-known/agent-card.json', host).toString();
    else
        host = new URL('agent-card.json', host).toString();

    console.log(`Verifying host is reachable: ${host}`)

    const response = await fetch(host);
    if (!response.ok)
        throw new Error(`Failed to reach host ${host}: ${response.statusText}`);

    return response.json();
}

async function resolveProfile(profileName: string, rl: readline.Interface) {
    let dir = join(os.homedir(), ".agentic", "iam", profileName);
    try {
        const { profile, keyring } = await loadProfileAndKeyring(dir);
        return { profile, keyring, name: profileName };
    } catch (error) {
        console.error(`Failed to load profile "${profileName}":`, prettyJson(error));
        let answer;
        do {
            const answer = (await rl.question('Do you want to create a new profile? (y/n) ')).toLowerCase();
            if( answer === 'y' )
                break;
            if( answer === 'n' )
                return;
        } while (true);
    }

    let name = (await rl.question(`Enter profile name (defaults to "${profileName}"):`)).trim();
    if (name === '')
        name = profileName;

    const { profile, keyring } = await createProfile(name);
    return { profile, keyring, name };
}

function createProfileAndKeyringResolver(pak: ProfileAndKeyring): ProfileAndKeyringResolver {
    return async (did) => {
        if (parseDid(did).did === pak.profile.id)
            return pak;
        throw new Error(`Profile not found for DID ${did}`);
    };
}
