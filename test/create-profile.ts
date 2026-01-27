import os from "os";
import { join } from "path";
import {
    createAgenticProfile,
    ServiceTemplate,
    prettyJson,
    webDidToUrl,
    JWKSet,
    AgenticProfile
} from "@agentic-profile/common";
import {
    createEdDsaJwk
} from "@agentic-profile/auth";
import { saveProfile } from "./local-files.js";
import { postJson } from "../src/authenticating-fetch/json.js";

export type CreateProfileResult = {
    profile: AgenticProfile,
    keyring: JWKSet[],
    did: string,
    b64uPublicKey: string
}

export async function createProfile(name: string, services?: ServiceTemplate[]): Promise<CreateProfileResult> {

    /*
    const port = process.env.PORT || 4004;
    const services = [
        {
            name: "Dashboard",
            type: "MCP",
            id: "dashboard",
            url: `http://localhost:${port}/mcp/dashboard`
        }
    ];*/
    const { profile, keyring, b64uPublicKey } = await createAgenticProfile({ services, createJwkSet: createEdDsaJwk });

    // publish profile to web (so did:web:... will resolve)
    const response = await fetch(
        "https://testing.agenticprofile.ai/agentic-profile",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ profile, b64uPublicKey })
        }
    );
    if (!response.ok)
        throw new Error(`Failed to create profile: ${response.statusText}`);

    const { profile: savedProfile } = await response.json();
    const did = savedProfile.id;
    console.log(`Published demo user agentic profile to:

${webDidToUrl(did)}

Or via DID at:

${did}
`);

    // also save locally for reference
    const dir = join(os.homedir(), ".agentic", "iam", name);
    await saveProfile({ dir, profile: savedProfile, keyring });

    console.log(`Saved demo user agentic profile to ${dir}`);

    console.log(`Shhhh! Keyring for testing... ${prettyJson(keyring)}`);

    return { profile: savedProfile, keyring, did, b64uPublicKey };
}
