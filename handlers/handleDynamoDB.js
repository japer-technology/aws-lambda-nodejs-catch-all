import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle DynamoDB Streams events.
 *
 * Dispatch criteria: triggered when `event.Records[0].eventSource` is
 * `'aws:dynamodb'`.
 *
 * Available event fields:
 *  - `Records[].eventID`, `eventName` and `awsRegion` describe the record.
 *  - `Records[].dynamodb.Keys`, `NewImage` and `OldImage` provide item data.
 * The Lambda `context` object supplies request metadata.
 *
 * See https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html
 */
export default async function handleDynamoDB(event, context) {
  const invocation = collectInvocation(event, context, 'dynamoDB');
  logDebug('invocation', invocation);
  logDebug('handleDynamoDB', { records: event.Records?.length, requestId: context.awsRequestId });
  event.Records?.forEach(r => logDebug('DynamoDB', r.dynamodb));
  return { processed: event.Records?.length || 0 };
}
