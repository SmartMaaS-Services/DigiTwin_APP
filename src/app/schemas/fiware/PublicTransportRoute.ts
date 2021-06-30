export type PublicTransportRoute = {
    id: string,
    type: string,
    name?: string,
    description?: string,
    transportationType: string,
    routeCode?: string,
    shortRouteCode?: string,
    routeSegments?: [
        {
            segmentName: string,
            refPublicTransportStops: string[]
        }
    ]
};
