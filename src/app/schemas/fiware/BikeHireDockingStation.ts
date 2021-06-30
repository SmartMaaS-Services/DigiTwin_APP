export type BikeHireDockingStation = {
    id: string,
    type: string,
    location: {
        type: string,
        coordinates: number[]
    },
    name?: string,
    description?: string,
    provider?: string,
    availableBikeNumber?: number,
    totalSlotNumber?: number,
    freeSlotNumber?: number,
    status?: string
};
