import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LogMessage, LOG_MESSAGE_SEPERATOR } from 'src/app/model/log-message';

@Component({
  selector: 'app-logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.scss']
})
export class LoggerComponent implements OnInit, OnChanges {
  @Input() message: LogMessage;
  internalMessage: string = '';

  constructor() {
    this.logMessage(
      {
        message: 'Logging initialized!',
        messageType: 'Init',
        component: 'Logger'
      });
  }
  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.message) {
      this.logMessage(changes.message.currentValue);
    }
  }

  private logMessage(message: LogMessage) {
    if (this.internalMessage != '') {
      this.internalMessage += '\r\n';
    }

    this.internalMessage += `${message.messageType} ${LOG_MESSAGE_SEPERATOR} ${message.component} ${LOG_MESSAGE_SEPERATOR} ${message.message}`;
  }
}
