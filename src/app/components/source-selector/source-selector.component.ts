import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TimeSeriesDataService } from 'src/app/services/timeseries-data.service';

@Component({
  selector: 'app-source-selector',
  templateUrl: './source-selector.component.html',
  styleUrls: ['./source-selector.component.scss']
})
export class SourceSelectorComponent implements OnInit, OnDestroy {
  private sourceSub: Subscription;

  sourceOptions: string[] = [];
  message: string = 'Init: Welcome!';

  constructor(private timeSeriesDataService: TimeSeriesDataService) {
  }

  ngOnInit(): void {
    this.logMessages("Fetching Timeseries sources...", "Info");

    this.sourceSub = this.timeSeriesDataService.getSources().subscribe(result => {
      this.logMessages("Successfully loaded time series sources", "Info");
      if (result.IsSuccess) {
        this.sourceOptions = result.Data;
        this.logMessages(`Total sources: ${this.sourceOptions.length}`, "Info");
      } else {
        this.logMessages(`Error while accessing api. ${result.ErrorMessage}`, "Error");
      }
    }, err => {
      this.logMessages(`Api is inaccessible. ${err.message}`, "Error");
    });
  }

  ngOnDestroy(): void {
    this.sourceSub.unsubscribe();
  }

  private logMessages(message: string, messageType: string) {
    this.message += '\r\n' + messageType + ": " + message;
  }
}