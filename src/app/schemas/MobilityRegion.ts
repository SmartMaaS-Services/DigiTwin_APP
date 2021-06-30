export type MobilityRegion = {
    id: string,
    type: string,
    name: string,
    description?: string,
    location?: {
        type: string,
        coordinates: number[] | number[][] | number[][][]
    }
};
