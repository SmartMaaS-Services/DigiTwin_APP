export type AirQualityObserved = {
    id: string,
    type: string,
    location: {
        type: string,
        coordinates: number[]
    },
    name?: string,
    description?: string,
    dateObserved: Date,
    refWheatherObserved?: string,
    pm10?: number,
    pm25?: number,
    refDevice?: string
};
