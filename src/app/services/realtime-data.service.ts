import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LogMessage } from '../model/log-message';
import { AggregationType, MultiValueTimeSeries, RealtimeEvent } from '../model/time-series';

@Injectable({
    providedIn: 'root',
})
export class RealTimeDataService {
    private signalRConn: signalR.HubConnection;
    private connected: boolean;

    newLogMessage: BehaviorSubject<LogMessage>;
    onDataReceived: BehaviorSubject<RealtimeEvent>;

    constructor() {
        this.newLogMessage = new BehaviorSubject<LogMessage>(
            {
                messageType: 'Info',
                message: 'Realtime data service initialized!',
                component: 'RealTimeDataService'
            });

        this.onDataReceived = new BehaviorSubject<RealtimeEvent>(null);

        this.connected = false;
    }

    connect(): Observable<boolean> {
        let subject = new Subject<boolean>();

        if (this.connected) {
            subject.next(true);
        } else {
            try {
                this.logMessage('Opening Signalr connection', 'Info');

                this.signalRConn = new signalR.HubConnectionBuilder().configureLogging(signalR.LogLevel.Information)
                    .withUrl(`${environment.apiBaseUrl}/realtime`)
                    .build();

                this.signalRConn.on('OnRealtimeDataReceived', (source: string, aggrType: AggregationType, data: MultiValueTimeSeries[]) => {
                    this.logMessage(`New data received for '${source}' with aggregation '${AggregationType[aggrType]}'`, 'Info');
                    this.onDataReceived.next({
                        Source: source,
                        AggrType: aggrType,
                        Data: data
                    });
                });

                this.signalRConn.start()
                    .then(_ => {
                        this.logMessage('Signalr connection successfully established.', 'Info');
                        this.connected = true;
                        subject.next(true);
                    })
                    .catch(err => {
                        this.logMessage(`Error occured while establishing signalr connection. ${err}`, 'Error');
                        subject.next(false);
                    });
            }
            catch (error) {
                this.logMessage(`Error occured while establishing signalr connection. ${error}`, 'Error');
                subject.next(false);
            }
        }

        return subject;
    }

    disconnect(): Observable<boolean> {
        let subject = new Subject<boolean>();

        this.signalRConn.stop()
            .then(_ => {
                this.logMessage('Signalr connection successfully stopped.', 'Info');
                subject.next(true);
            })
            .catch(err => {
                this.logMessage(`Error occured while stopping signalr connection. ${err}`, 'Error')
                subject.next(false);
            });

        return subject;
    }

    startSubscription(dataSource: string, aggregationType: string): Observable<boolean> {
        let subject = new Subject<boolean>();

        this.signalRConn.send("Subscribe", dataSource, aggregationType).then(_ => {
            this.logMessage(`Successfully subscribed to '${dataSource}', with aggregation type as '${aggregationType}'.`, 'Info');
            subject.next(true);
        }).catch(err => {
            this.logMessage(`Error occured while subscribing to '${dataSource}', with aggregation type as '${aggregationType}'. ${err}`, 'Error');
            subject.next(false);
        });

        return subject;
    }

    stopSubscription(dataSource: string, aggregationType: string): Observable<boolean> {
        let subject = new Subject<boolean>();

        this.signalRConn.send("Unsubscribe", dataSource, aggregationType).then(_ => {
            this.logMessage(`Successfully removed subscription for '${dataSource}', with aggregation type as '${aggregationType}'.`, 'Info');
            subject.next(true);
        }).catch(err => {
            this.logMessage(`Error occurred while removing subscription for '${dataSource}', with aggregation type as '${aggregationType}'. ${err}`, 'Error');
            subject.next(false);
        });

        return subject;
    }

    logMessage(message: string, messageType: string) {
        this.newLogMessage.next({
            messageType: messageType,
            message: message,
            component: 'RealTimeDataService'
        });
    }
}