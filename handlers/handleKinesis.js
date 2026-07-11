import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle Kinesis stream events.
 *
 * Dispatch criteria: executed when `event.Records[0].eventSource` equals `'aws:kinesis'`.
 *
 * Available event fields:
 *  - `Records[].eventID` and `kinesis.partitionKey` identify the record.
 *  - `Records[].kinesis.data` and `approximateArrivalTimestamp` hold payload data.
 * The Lambda `context` object supplies request metadata.
 *
 * See https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html
 */
export default async function handleKinesis(event, context) {
  const invocation = collectInvocation(event, context, 'kinesis');
  logDebug('invocation', invocation);
  logDebug('handleKinesis', { records: event.Records?.length, requestId: context.awsRequestId });
  event.Records?.forEach(r => {
    const data = Buffer.from(r.kinesis.data, 'base64').toString('utf8');
    logDebug('Kinesis', data);
  });
  return { processed: event.Records?.length || 0 };
}
