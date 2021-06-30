export type OffStreetParking = {
    id: string,
    type: string,
    location: {
        type: string,
        coordinates: number[]
    },
    name?: string,
    description?: string,
    category?: string[],
    chargeType?: string[],
    allowedVehicleType?: string[],
    refParkingSpot?: string[],
    totalSpotNumber?: number,
    availableSpotNumber?: number,
    occupiedSpotNumber?: number,
    occupancy?: number
};
