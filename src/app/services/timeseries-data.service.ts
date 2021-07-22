import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ApiResponse } from "../model/ApiResponse";

@Injectable({
    providedIn: 'root',
})
export class TimeSeriesDataService {
    private readAPI: string = `${environment.apiBaseUrl}/api/timeseries/ReadData`;

    constructor(private http: HttpClient) { }

    getSources() {
        return this.http.get<ApiResponse<string[]>>(`${this.readAPI}/sources`);
    }

    getSupportAggregationTypes() {
        return this.http.get<ApiResponse<string[]>>(`${this.readAPI}/aggregationtypes`);
    }
}