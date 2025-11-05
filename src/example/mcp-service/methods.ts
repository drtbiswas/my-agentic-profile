import { JSONRPCRequest, JSONRPCResponse, JSONRPCError } from '@modelcontextprotocol/sdk/types.js';
import { jrpcError, jrpcResult, jrpcErrorAuthRequired } from '../../json-rpc/index.js';
import { ClientAgentSession } from '@agentic-profile/auth';
import { Request } from 'express';
import { DID } from '@agentic-profile/common/schema';
import { LocationUpdate, EventUpdate, EventAttendeeUpdate,LocationPresence, NearbyAgent, Geocoordinates } from './types.js';


export async function handleToolsCall(request: JSONRPCRequest, session: ClientAgentSession, req: Request): Promise<JSONRPCResponse | JSONRPCError> {
    const { name } = request.params || {};
    console.log('🔍 handleToolsCall', name, request, session);
    
    switch (name) {
        case 'update-location':
            return await handleUpdateLocation(request,session,req);
        case 'update-event':
            return await handleUpdateEvent(request,session,req);
        default:
            return jrpcError(request.id!, -32601, `Tool ${name} not found`);
    }
}

async function handleUpdateLocation(request: JSONRPCRequest, session: ClientAgentSession, _req: Request): Promise<JSONRPCResponse | JSONRPCError> {
    const args = request.params?.arguments as LocationUpdate;
    const agentDid = args.agentDid ?? session?.agentDid
    if( !agentDid )
        return jrpcErrorAuthRequired( request.id );

    const result = await saveLocation( agentDid, args);
    return jrpcResult(request.id!, result);
}

async function handleUpdateEvent(request: JSONRPCRequest, session: ClientAgentSession, _req: Request): Promise<JSONRPCResponse | JSONRPCError> {
    const args = request.params?.arguments as EventUpdate;
    const agentDid = args.agentDid ?? session?.agentDid
    if( !agentDid )
        return jrpcErrorAuthRequired( request.id );

    const result = await saveEvent( agentDid, args);
    return jrpcResult(request.id!, result);
}

//
// Storage
//

//==== Locations ====

const locationStore = new Map<string, LocationPresence>();

interface SaveLocationResult {
    did: DID,
    coords: Geocoordinates,
    nearby: NearbyAgent[]
}

function saveLocation( agentDid: DID, location: LocationUpdate ): SaveLocationResult {
    
    const coords = location.coords;
    const presence: LocationPresence = {
        agentDid,
        coords,
        updated: new Date()
    }
    locationStore.set(agentDid, presence);

    // find nearby people
    const nearby = Array.from(locationStore.values()).map(p=>{
        const distance = calculateDistance(coords, p.coords);
        return {
            did: p.agentDid as DID,
            distance,
            updated: p.updated
        } as NearbyAgent;
    }).sort((a,b)=>a.distance - b.distance).slice(0, 10);

    return { did: agentDid, coords, nearby };
}

function calculateDistance( coords1: Geocoordinates, coords2: Geocoordinates ): number {
    // Haversine formula for calculating distance on a sphere (Earth)
    const R = 6371; // Earth's radius in kilometers
    const lat1 = coords1.latitude * Math.PI / 180; // Convert to radians
    const lon1 = coords1.longitude * Math.PI / 180;
    const lat2 = coords2.latitude * Math.PI / 180;
    const lon2 = coords2.longitude * Math.PI / 180;
    
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
}

//==== Events ====

const eventStore = new Map<string, EventAttendeeUpdate[]>();

interface SaveEventResult {
    eventUrl: string,
    did: DID,
    attendees: EventAttendeeUpdate[]
}

function saveEvent( agentDid: DID, event: EventUpdate ): SaveEventResult {

    let attendees = (eventStore.get(agentDid) ?? []) as EventAttendeeUpdate[];
    // Remove any previous entry for myself
    attendees = attendees.filter(e => e.did !== agentDid);
    // Add myself back with updated rsvp
    attendees.push({ did: agentDid, rsvp: event.rsvp, updated: new Date().toISOString() });

    eventStore.set(agentDid, attendees);

    return { eventUrl: event.eventUrl, did: agentDid, attendees } as SaveEventResult;
}
