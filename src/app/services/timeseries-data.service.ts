import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ApiResponse } from "../model/api-response";
import { SingleValueTimeSeries, MultiValueTimeSeries } from "../model/time-series";

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

    getLatestRawData(source: string) {
        return this.http.get<ApiResponse<MultiValueTimeSeries>>(`${this.readAPI}/${source}/getlatest`)
    }

    getLatestAggrData(source: string, aggregationType: string) {
        return this.http.get<ApiResponse<SingleValueTimeSeries>>(`${this.aggrReadAPI}/${source}/getlatest?aggregationType=${aggregationType}`)
    }
}