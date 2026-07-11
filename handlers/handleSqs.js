import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle Amazon SQS events.
 *
 * Dispatch criteria: triggered when `event.Records[0].eventSource` equals `'aws:sqs'`.
 *
 * Available event fields:
 *  - `Records[].messageId`, `receiptHandle` and `body`.
 *  - `Records[].attributes` and `messageAttributes`.
 * The Lambda `context` object is available for metadata.
 *
 * See https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
 */
export default async function handleSqs(event, context) {
  const invocation = collectInvocation(event, context, 'sqs');
  logDebug('invocation', invocation);
  logDebug('handleSqs', { messages: event.Records?.length, requestId: context.awsRequestId });
  event.Records?.forEach(r => logDebug('SQS', r.body));
  return { processed: event.Records?.length || 0 };
}
