export const MCP_TOOLS = [
    {
        name: 'update-location',
        description: 'Update geolocation or event interest or attendance',
        inputSchema: {
            type: 'object',
            properties: {
                coords: {
                    type: 'object',
                    description: 'The geolocation',
                    properties: {
                        latitude: {
                            type: 'number',
                            description: 'The latitude'
                        },
                        longitude: {
                            type: 'number',
                            description: 'The longitude'
                        }
                    }
                },
                query: {
                    type: 'object',
                    description: 'The location query',
                    properties: {
                        withinMeters: {
                            type: 'number',
                            description: 'The radius in meters'
                        },
                        maxAge: {
                            type: 'number',
                            description: 'The maximum age in minutes'
                        }
                    }
                },
                agentDid: {
                    type: 'string',
                    description: 'The agent DID'
                }
            },
            required: ['coords']
        }
    },
    {
        name: 'update-event',
        description: 'Update event interest or attendance',
        inputSchema: {
            type: 'object',
            properties: {
                eventUrl: {
                    type: 'string',
                    description: 'The event URL'
                },
                rsvp: {
                    type: 'string',
                    description: 'The RSVP status',
                    enum: ['yes', 'no', 'maybe']
                },
                agentDid: {
                    type: 'string',
                    description: 'The agent DID'
                }
            },
            required: ['eventUrl']
        }
    }
];
