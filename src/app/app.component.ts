import { Component } from '@angular/core';
import { LogMessage, SourceSubscriptionChange } from './model/log-message';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  logMessage: LogMessage;
  sourceSubscriptionChange: SourceSubscriptionChange;

  newLogMessage(message: LogMessage) {
    this.logMessage = message;
  }

  sourceSubscriptionChanged(changedSourceSub: SourceSubscriptionChange) {
    this.sourceSubscriptionChange = changedSourceSub;
  }
}