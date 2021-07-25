import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTable } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { LogMessage, SourceSubscriptionChange } from 'src/app/model/log-message';
import { TimeSeriesDataService } from 'src/app/services/timeseries-data.service';

@Component({
  selector: 'app-real-time-data',
  templateUrl: './real-time-data.component.html',
  styleUrls: ['./real-time-data.component.scss']
})
export class RealTimeDataComponent implements OnInit, OnDestroy, OnChanges {
  private aggrSub: Subscription;
  private aggregationTypes: string[];
  private readonly indexColName: string = 'Index';
  private readonly subIdSeperator: string = '_';

  displayedColumns: string[];
  sourceDataSubs: string[];
  displayTable: boolean;
  dataSource = [];

  @Output() onLogMessage = new EventEmitter<LogMessage>();
  @Input() sourceSubChange: SourceSubscriptionChange;

  @ViewChild(MatTable) table: MatTable<string>;

  constructor(private timeSeriesDataSvc: TimeSeriesDataService) {
    this.aggregationTypes = ['Raw'];
    this.displayedColumns = [this.indexColName];
    this.displayTable = false;
    this.sourceDataSubs = [];
    this.dataSource = [];
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    try {
      if (changes.sourceSubChange) {
        var ssc: SourceSubscriptionChange = changes.sourceSubChange.currentValue;

        if (ssc?.subscribe) {
          this.displayedColumns.push(...this.aggregationTypes.map(a => `${ssc.source}${this.subIdSeperator}${a}`));
        } else {
          this.displayedColumns = this.displayedColumns.filter(c => !c.startsWith(ssc.source) || c == this.indexColName);
          this.stopDataSubscription(this.sourceDataSubs.filter(c => c.startsWith(ssc.source)));
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
  }

  onDataSubToggle(ob: MatCheckboxChange) {
    if (ob.checked) {
      this.startDataSubscription([ob.source.id]);
    } else {
      this.stopDataSubscription([ob.source.id]);
    }
  }

  isSubscribed(dataSourceId: string): boolean {
    return this.sourceDataSubs.indexOf(dataSourceId, 0) > -1;
  }

  private startDataSubscription(dataSourceIds: string[]) {
    this.logMessage(`Starting data subscription for ${dataSourceIds}`, 'Info');
    this.sourceDataSubs.push(...dataSourceIds);
  }

  private stopDataSubscription(dataSourceIds: string[]) {
    for (const dsId in dataSourceIds) {
      this.logMessage(`Stopping data subscription for ${dataSourceIds}`, 'Info');
      this.sourceDataSubs.splice(this.sourceDataSubs.indexOf(dsId, 0), 1);
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