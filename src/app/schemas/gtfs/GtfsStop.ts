export type GtfsStop = {
    id: string,
    type: string,
    name: string,
    description?: string,
    location: {
        type: string,
        coordinates: number[]
    },
    operatedBy?: string
};
