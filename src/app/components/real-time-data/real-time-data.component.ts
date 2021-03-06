import {
  Component, EventEmitter, Input, OnChanges, OnDestroy,
  OnInit, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTable } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { LogMessage, SourceSubscriptionChange } from 'src/app/model/log-message';
import { AggregationType, MultiValueTimeSeries, SingleValueTimeSeries } from 'src/app/model/time-series';
import { RealTimeDataService } from 'src/app/services/realtime-data.service';
import { TimeSeriesDataService } from 'src/app/services/timeseries-data.service';

@Component({
  selector: 'app-real-time-data',
  templateUrl: './real-time-data.component.html',
  styleUrls: ['./real-time-data.component.scss']
})
export class RealTimeDataComponent implements OnInit, OnDestroy, OnChanges {
  private aggrSub: Subscription;
  private signalRSub: Subscription;
  private realtimeDataSub: Subscription;
  private aggregationTypes: string[];
  private connected: boolean;
  private readonly indexColName: string = 'Index';
  private readonly subIdSeperator: string = '_';

  displayedColumns: string[];
  sourceDataSubs: string[];
  displayTable: boolean;
  dataSource = [];

  @Output() onLogMessage = new EventEmitter<LogMessage>();
  @Input() sourceSubChange: SourceSubscriptionChange;

  @ViewChild(MatTable) table: MatTable<string>;

  constructor(private timeSeriesDataSvc: TimeSeriesDataService,
    private realTimeDataSvc: RealTimeDataService) {
    this.aggregationTypes = [];
    this.displayedColumns = [this.indexColName];
    this.displayTable = false;
    this.sourceDataSubs = [];
    this.dataSource = [];
    this.connected = false;
  }

  ngOnInit(): void {
    this.logMessage('Fetching supported aggregation types...', 'Info');

    this.aggrSub = this.timeSeriesDataSvc.getSupportAggregationTypes().subscribe(s => {
      if (s.IsSuccess) {
        this.aggregationTypes.push(...s.Data);
        this.logMessage(`Total supported aggregation types: ${this.aggregationTypes.length}`, 'Info');
      } else {
        this.logMessage(`Error occured while fetching supported aggregation types. ${s.ErrorMessage}`, 'Error');
      }
    }, error => {
      this.logMessage(`Error occured while fetching supported aggregation types. ${error.message}`, 'Error');
    });

    this.signalRSub = this.realTimeDataSvc.connect()
      .subscribe(success => this.connected = success);

    this.realtimeDataSub = this.realTimeDataSvc.onDataReceived
      .subscribe(realtimeEvent => {
        if (realtimeEvent) {
          this.dataReceived(realtimeEvent.Data[0], `${realtimeEvent.Source}${this.subIdSeperator}${AggregationType[realtimeEvent.AggrType]}`)
        }
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    try {
      if (changes.sourceSubChange) {
        var ssc: SourceSubscriptionChange = changes.sourceSubChange.currentValue;

        if (ssc?.subscribe) {
          this.displayedColumns.push(...this.aggregationTypes.map(a => `${ssc.source}${this.subIdSeperator}${a}`));
        } else {
          this.displayedColumns = this.displayedColumns.filter(c => !c.startsWith(ssc.source) || c == this.indexColName);
          this.sourceDataSubs.map(s => {
            if (s.startsWith(ssc.source)) {
              this.stopDataSubscription(s);
            }
          });
        }

        this.displayTable = this.displayedColumns.length > 1;
        if (this.displayTable) {
          this.table.renderRows();
        }
      }
    }
    catch {
      // EATING THE EXCEPTION. FOR SOME REASON AN EXCEPTION OCCURS INTERMITTENTLY DURING LOAD
    }
  }

  ngOnDestroy(): void {
    this.aggrSub.unsubscribe();
    this.realTimeDataSvc.disconnect();

    this.signalRSub.unsubscribe();
    this.realtimeDataSub.unsubscribe();
  }

  onDataSubToggle(ob: MatCheckboxChange) {
    if (ob.checked) {
      this.startDataSubscription(ob.source.id);
    } else {
      this.stopDataSubscription(ob.source.id);
    }
  }

  isSubscribed(dataSourceId: string): boolean {
    return this.sourceDataSubs.indexOf(dataSourceId, 0) > -1;
  }

  private startDataSubscription(dataSourceId: string) {
    if (this.connected) {
      let dsIdSplit = dataSourceId.split(this.subIdSeperator);

      if (dsIdSplit[1] == 'Raw') {
        this.timeSeriesDataSvc.getLatestRawData(dsIdSplit[0]).subscribe(response => {
          if (response.IsSuccess && response.Data.Values.length > 0) {
            this.dataReceived(response.Data, dataSourceId);
          } else {
            this.logMessage(`${dataSourceId} does not have any realtime data yet`, 'Info');
          }
        });
      } else {
        this.timeSeriesDataSvc.getLatestAggrData(dsIdSplit[0], dsIdSplit[1]).subscribe(response => {
          this.dataReceived(response.Data, dataSourceId);
        });
      }

      this.realTimeDataSvc.startSubscription(dsIdSplit[0], dsIdSplit[1]).subscribe(success => {
        if (success) {
          this.sourceDataSubs.push(dataSourceId);
        } else {
          this.logMessage(`Please try again later. Unable to start subscription for ${dataSourceId}`, 'Info');
        }
      });
    } else {
      this.logMessage('Unable to subscribe as signalr connection is not established yet.', 'Warn');
    }
  }

  private stopDataSubscription(dataSourceId: string) {
    let dataSourceSubIndex = this.sourceDataSubs.indexOf(dataSourceId, 0);

    if (dataSourceSubIndex > -1) {
      let dsIdSplit = dataSourceId.split(this.subIdSeperator);
      this.realTimeDataSvc.stopSubscription(dsIdSplit[0], dsIdSplit[1]).subscribe(success => {
        if (success) {
          this.sourceDataSubs.splice(dataSourceSubIndex, 1);
        } else {
          this.logMessage(`Please try again later. Unable to stop subscription for ${dataSourceId}`, 'Info');
        }
      });
    }
  }

  private dataReceived(data: SingleValueTimeSeries | MultiValueTimeSeries, dataSourceId: string) {
    let indexExists: boolean = true;
    let dataRow = this.dataSource.find(row => row[this.indexColName] == data.Time);
    if (dataRow == undefined) {
      dataRow = {};
      dataRow[this.indexColName] = data.Time;
      indexExists = false;
    }
    dataRow[dataSourceId] = this.getValue(data);
    if (!indexExists) {
      this.dataSource.push(dataRow);
    }
    if (this.dataSource.length > 10) {
      this.dataSource.shift();
    }

    this.table.renderRows();
  }

  private getValue(data: SingleValueTimeSeries | MultiValueTimeSeries): string {
    var mTimeSeries = data as MultiValueTimeSeries;

    if (mTimeSeries.Values) {
      return mTimeSeries.Values.toString();
    } else {
      return (data as SingleValueTimeSeries).Value.toString();
    }
  }

  private logMessage(message: string, messageType: string) {
    this.onLogMessage.emit({
      message: message,
      messageType: messageType,
      component: 'RealTimeData'
    });
  }
}