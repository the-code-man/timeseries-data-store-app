export interface RawTimeSeries {
    Time: Date;
    Values: number[];
}

export interface AggrTimeSeries {
    Time: Date;
    Value: number;
}

export enum AggregationType
{
    Raw = 0,
    Avg,
    Min,
    Max
}