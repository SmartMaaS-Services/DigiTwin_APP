export type ParkingSpot = {
    id: string,
    type: string,
    location: {
        type: string,
        coordinates: number[]
    },
    name?: string,
    description?: string,
    refParkingSite: string,
    category: string[],
    status: string,
    refDevice?: string
};
