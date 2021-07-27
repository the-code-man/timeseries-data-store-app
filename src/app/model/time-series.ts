export interface MultiValueTimeSeries {
    Time: Date;
    Values: number[];
}

export interface SingleValueTimeSeries {
    Time: Date;
    Value: number;
}

export interface RealtimeEvent {
    Source: string;
    AggrType: AggregationType;
    Data: MultiValueTimeSeries[];
}

export enum AggregationType {
    Raw,
    Avg,
    Min,
    Max
}