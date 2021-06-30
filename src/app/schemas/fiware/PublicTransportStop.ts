export type PublicTransportStop = {
    id: string,
    type: string,
    name: string,
    description?: string,
    location?: {
        type: string,
        coordinates: number[]
    },
    transportationType: string[],
    stopCode?: string,
    shortStopCode?: string,
    refPublicTransportRoute?: string[]
};
