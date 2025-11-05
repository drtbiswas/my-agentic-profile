import { DID } from "@agentic-profile/common/schema";

//
// Events
//

export interface BatchEventUpdate {
    events: EventUpdate[]
}

export interface EventUpdate {
    eventUrl: string,
    rsvp?: RSVP,
    broadcast?: boolean,
    agentDid?: DID
}

export interface EventPresence {
    eventUrl: string,
    agentDid: DID,
    updated: Date
}

export interface EventListingUpdate {
    title?: string,
    description?: string,
    startDate?: string | Date,
    endDate?: string | Date,
    address?: PostalAddress,
    coords?: Geocoordinates
}

export interface EventAttendeeUpdate {
    did: DID,
    rsvp?: RSVP,
    updated: string |Date
}

//=== out ===

export interface BatchEventUpdateResult {
    events: Event[]
}

export interface EventUpdateResult {
    eventUrl: string,
    listing: EventListing,
    attendees: EventAttendee[]
}

export interface EventListing {
    eventUrl: string,
    title: string,
    description?: string,
    startDate: string | Date,
    endDate: string | Date,
    address: PostalAddress,
    coords: Geocoordinates,
    updated: string | Date
}

export interface PostalAddress {
    name: string,
    street: string,
    city: string,
    state: string,
    country: string
}

export interface EventAttendee {
    did: DID,
    rsvp?: RSVP
    updated: string | Date
}

export type RSVP = "yes" | "no" | "maybe";

//
// Locations
//

export interface LocationPresence {
    agentDid: DID,
    coords: Geocoordinates,
    updated: Date
}

export interface LocationUpdate {
    broadcast?: boolean
    coords: Geocoordinates
    query?: LocationQuery
    agentDid?: DID
}

export interface Geocoordinates {
    latitude: number,
    longitude: number
}

export interface LocationQuery {
    withinMeters: number    // meters
    maxAge: number          // minutes
}

//=== out ===

export interface NearbyAgent {
    did: DID,
    distance: number    // meters
    updated: Date
}