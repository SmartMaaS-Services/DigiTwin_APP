export type GtfsStopTime = {
    id: string,
    type: string,
    name?: string,
    description?: string,
    hasTrip: string,
    hasStop: string,
    stopSequence: number,
    arrivalTime: string,
    departureTime: string,
    pickupType: string,
    dropOffType: string
};
