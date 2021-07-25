export const LOG_MESSAGE_SEPERATOR = '<>';

export interface LogMessage
{
    message: string;
    messageType: string;
    component: string;
}

export interface SourceSubscriptionChange
{
    source: string;
    subscribe: boolean;
}