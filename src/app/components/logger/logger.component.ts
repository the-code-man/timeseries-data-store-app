import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogMessage, LOG_MESSAGE_SEPERATOR } from 'src/app/model/log-message';
import { RealTimeDataService } from 'src/app/services/realtime-data.service';

@Component({
  selector: 'app-logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.scss']
})
export class LoggerComponent implements OnInit, OnChanges, OnDestroy {
  private newLogMessageSub: Subscription;
  @Input() message: LogMessage;

  @ViewChild('txtLogMessage') txtLogMessage: ElementRef;

  internalMessage: string = '';
  scrolltop: number = null;

  constructor(private realTimeDataSvc: RealTimeDataService) {
    this.logMessage(
      {
        message: 'Logging initialized!',
        messageType: 'Init',
        component: 'Logger'
      });

    this.newLogMessageSub = this.realTimeDataSvc.newLogMessage.subscribe(msg => this.logMessage(msg));
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.message) {
      this.logMessage(changes.message.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.newLogMessageSub.unsubscribe();
  }

  private logMessage(message: LogMessage) {
    if (this.internalMessage != '') {
      this.internalMessage += '\r\n';
    }

    this.internalMessage += `${message.messageType} ${LOG_MESSAGE_SEPERATOR} ${message.component} ${LOG_MESSAGE_SEPERATOR} ${message.message}`;

    if (this.txtLogMessage) {
      this.scrolltop = this.txtLogMessage.nativeElement.scrollHeight + 10;
    }
  }
}
