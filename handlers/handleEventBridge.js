import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle EventBridge events.
 *
 * Dispatch criteria: chosen when `event.source` and `event['detail-type']` exist.
 *
 * Available event fields:
 *  - `version`, `id`, `detail-type` and `source` identify the event.
 *  - `account`, `region`, `time`, `resources` and `detail` contain event data.
 * The Lambda `context` object is available for runtime information.
 *
 * See https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-service-lambda.html
 */
export default async function handleEventBridge(event, context) {
  const invocation = collectInvocation(event, context, 'eventBridge');
  logDebug('invocation', invocation);
  logDebug('handleEventBridge', { detailType: event['detail-type'], requestId: context.awsRequestId });
  logDebug('EventBridge event', event['detail-type']);
  return { processed: true };
}
