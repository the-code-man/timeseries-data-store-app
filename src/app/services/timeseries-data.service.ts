import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ApiResponse } from "../model/api-response";
import { AggrTimeSeries, RawTimeSeries } from "../model/time-series";

@Injectable({
    providedIn: 'root',
})
export class TimeSeriesDataService {
    private readAPI: string = `${environment.apiBaseUrl}/api/timeseries/ReadData`;
    private aggrReadAPI: string = `${environment.apiBaseUrl}/api/timeseries/AggregatedData`;

    constructor(private http: HttpClient) { }

    getSources() {
        return this.http.get<ApiResponse<string[]>>(`${this.readAPI}/sources`);
    }

    getSupportAggregationTypes() {
        return this.http.get<ApiResponse<string[]>>(`${this.readAPI}/aggregationtypes`);
    }

    getLatest(source: string, aggregationType?: string) {
        if (aggregationType == null) {
            return this.http.get<ApiResponse<RawTimeSeries>>(`${this.readAPI}/${source}/getlatest`)
        } else {
            return this.http.get<ApiResponse<AggrTimeSeries>>(`${this.aggrReadAPI}/${source}/getlatest?aggregationType=${aggregationType}`)
        }
    }
}