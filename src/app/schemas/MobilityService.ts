export type MobilityService = {
    id: string,
    type: string,
    name: string,
    description?: string,
    location?: {
        type: string,
        coordinates: number[] | number[][] | number[][][]
    },
    refMobilityStation: string,
    service: string,
    refServiceProvider?: string
};
