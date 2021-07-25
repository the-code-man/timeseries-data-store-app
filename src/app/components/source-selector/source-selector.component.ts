import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Subscription } from 'rxjs';
import { LogMessage, SourceSubscriptionChange } from 'src/app/model/log-message';
import { TimeSeriesDataService } from 'src/app/services/timeseries-data.service';

@Component({
  selector: 'app-source-selector',
  templateUrl: './source-selector.component.html',
  styleUrls: ['./source-selector.component.scss']
})
export class SourceSelectorComponent implements OnInit, OnDestroy {
  private sourceSub: Subscription;

  sourceOptions: string[] = [];

  @Output() onLogMessage = new EventEmitter<LogMessage>();
  @Output() onSourceSubscriptionChange = new EventEmitter<SourceSubscriptionChange>();

  constructor(private timeSeriesDataSvc: TimeSeriesDataService) { }

  ngOnInit(): void {
    this.logMessage('Fetching Timeseries sources...', 'Info');

    this.sourceSub = this.timeSeriesDataSvc.getSources().subscribe(result => {
      this.logMessage('Successfully loaded time series sources', 'Info');
      if (result.IsSuccess) {
        this.sourceOptions = result.Data;
        this.logMessage(`Total sources: ${this.sourceOptions.length}`, 'Info');
      } else {
        this.logMessage(`Error while accessing api. ${result.ErrorMessage}`, 'Error');
      }
    }, err => {
      this.logMessage(`Api is inaccessible. ${err.message}`, 'Error');
    });
  }

  ngOnDestroy(): void {
    this.sourceSub.unsubscribe();
  }

  onSourceChange(ob: MatCheckboxChange) {
    this.onSourceSubscriptionChange.emit(
      {
        source: ob.source.id,
        subscribe: ob.checked
      });
  }

  private logMessage(message: string, messageType: string) {
    this.onLogMessage.emit({
      message: message,
      messageType: messageType,
      component: 'SourceSelector'
    });
  }
}