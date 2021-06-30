export type WeatherObserved = {
    id: string,
    type: string,
    location: {
        type: string,
        coordinates: number[]
    },
    name?: string,
    description?: string,
    dateObserved: Date,
    atmosphericPressure?: number,
    relativeHumidity?: number,
    temperature?: number,
    windDirection?: number,
    windSpeed?: number,
    refDevice?: string
};
