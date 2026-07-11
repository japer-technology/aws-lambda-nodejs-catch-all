import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle Amazon SNS events.
 *
 * Dispatch criteria: invoked when `event.Records[0].eventSource` equals `'aws:sns'`.
 *
 * Available event fields:
 *  - `Records[].Sns.MessageId`, `TopicArn`, `Subject` and `Message`.
 *  - `Records[].Sns.Timestamp` and `MessageAttributes`.
 * The Lambda `context` object provides runtime metadata.
 *
 * See https://docs.aws.amazon.com/lambda/latest/dg/with-sns.html
 */
export default async function handleSns(event, context) {
  const invocation = collectInvocation(event, context, 'sns');
  logDebug('invocation', invocation);
  logDebug('handleSns', { messages: event.Records?.length, requestId: context.awsRequestId });
  event.Records?.forEach(r => logDebug('SNS', r.Sns.Message));
  return { processed: event.Records?.length || 0 };
}
