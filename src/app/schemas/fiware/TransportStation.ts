export type TransportStation = {
    id: string,
    type: string,
    name: string,
    description?: string,
    location?: {
        type: string,
        coordinates: number[]
    },
    stationType: string,
    locationType: string,
    dateLastReported?: string,
    dateObserved?: string
};
