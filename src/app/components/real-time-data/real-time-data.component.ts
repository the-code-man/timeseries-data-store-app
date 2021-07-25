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
  private readonly indexColName = 'Index';
  private aggregationTypes: string[] = ['Raw'];

  displayedColumns: string[] = [this.indexColName];
  displayTable: boolean = false;
  subscribedSources: string[] = [];
  dataSource = [];

  @Output() onLogMessage = new EventEmitter<LogMessage>();
  @Input() sourceSubChange: SourceSubscriptionChange;

  @ViewChild(MatTable) table: MatTable<string>;

  constructor(private timeSeriesDataSvc: TimeSeriesDataService) { }

  ngOnInit(): void {
    this.logMessage('Fetching supported aggregation types...', 'Info', 'RealTimeData');

    this.aggrSub = this.timeSeriesDataSvc.getSupportAggregationTypes().subscribe(s => {
      if (s.IsSuccess) {
        this.aggregationTypes.push(...s.Data);
        this.logMessage(`Total supported aggregation types :${this.aggregationTypes.length}`, 'Info', 'RealTimeData');
      } else {
        this.logMessage(`Error occured while fetching supported aggregation types. ${s.ErrorMessage}`, 'Error', 'RealTimeData');
      }
    }, error => {
      this.logMessage(`Error occured while fetching supported aggregation types. ${error.message}`, 'Error', 'RealTimeData');
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    try {
      if (changes.sourceSubChange) {
        var ssc: SourceSubscriptionChange = changes.sourceSubChange.currentValue;
  
        if (ssc?.subscribe) {
          this.displayedColumns.push(...this.aggregationTypes.map(a => `${ssc.source}_${a}`));
        } else {
          this.displayedColumns = this.displayedColumns.filter(c => !c.startsWith(ssc.source) || c == this.indexColName);
        }
  
        this.displayTable = this.displayedColumns.length > 1;
        if (this.displayTable) {
          this.table.renderRows();
        }
      }      
    }
    catch {
      // EATING THE EXCEPTION. FOR SOME REASON AN EXCEPTION OCCURS INTERMITTENTLY
    }
  }

  ngOnDestroy(): void {
    this.aggrSub.unsubscribe();
  }

  onDataSubToggle(ob: MatCheckboxChange) {

  }

  private logMessage(message: string, messageType: string, component: string) {
    this.onLogMessage.emit({
      message: message,
      messageType: messageType,
      component: component
    });
  }
}