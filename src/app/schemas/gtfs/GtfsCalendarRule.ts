export type GtfsCalendarRule = {
    id: string,
    type: string,
    name?: string,
    description?: string,
    hasService: string,
    monday: boolean,
    tuesday: boolean,
    wednesday: boolean,
    thursday: boolean,
    friday: boolean,
    saturday: boolean,
    sunday: boolean,
    startDate: string,
    endDate: string
};
