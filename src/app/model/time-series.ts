export interface RawTimeSeries {
    Time: Date;
    Values: number[];
}

export interface AggrTimeSeries {
    Time: Date;
    Values: number;
}