export type MobilityStation = {
    id: string,
    type: string,
    name: string,
    description?: string,
    location: {
        type: string,
        coordinates: number[] | number[][] | number[][][]
    },
    refMobilityRegion: string
};
