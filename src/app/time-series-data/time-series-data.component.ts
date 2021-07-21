import { Component, OnInit } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-time-series-data',
  template: `
    <p>
      time-series-data works!
    </p>
  `,
  styles: [
  ]
})
export class TimeSeriesDataComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {

    this.http.get(`${environment.apiBaseUrl}/api/timeseries/ReadData`).subscribe(o => console.log(o));

    const connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl(`${environment.apiBaseUrl}/realtime`)
      .build();

    connection.on('OnProcessed', (arg1, arg2) => {
      console.log(`${arg1}---${arg2}`);
    });

    connection.start().then(() => {
      connection.send("Subscribe", [{ Source: 'FQREW', AggregationType: 'Avg' }])
        .then(() => console.log('Subscribed'))
        .catch(err => console.error(err));
    }).catch(err => console.error(err));
  }
}
