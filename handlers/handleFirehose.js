import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle Kinesis Firehose data transformation events.
 *
 * Dispatch criteria: selected when `event.records` is an array of Firehose records.
 *
 * Available event fields:
 *  - `records[].recordId`: identifier for each incoming record.
 *  - `records[].data`: Base64 encoded payload.
 *  - `records[].approximateArrivalTimestamp`: when the record arrived.
 * The standard Lambda `context` object is also provided.
 *
 * See https://docs.aws.amazon.com/firehose/latest/dev/data-transformation.html#lambda-transformation-event
 */
export default async function handleFirehose(event, context) {
  const invocation = collectInvocation(event, context, 'firehose');
  logDebug('invocation', invocation);
  logDebug('handleFirehose', { count: event.records?.length, requestId: context.awsRequestId });
  const output = event.records?.map(r => ({ recordId: r.recordId, result: 'Ok', data: r.data })) ?? [];
  return { records: output };
}
