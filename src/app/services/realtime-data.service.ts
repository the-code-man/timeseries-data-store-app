import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class RealTimeDataService {
    constructor() { }

    connect() {
        const connection = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.Information)
            .withUrl(`${environment.apiBaseUrl}/realtime`)
            .build();

        connection.on('OnProcessed', (arg1, arg2) => {
            console.log(`${arg1} --- ${arg2}`);
        });

        connection
            .start()
            .then(_ => console.log("Request sent for establising connection!"))
            .catch(err => console.error(err));
    }
}