import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle scheduled CloudWatch events.
 *
 * Dispatch criteria: triggered when `event.source === 'aws.events'`.
 *
 * Available event fields:
 *  - `version`, `id` and `detail-type`.
 *  - `account`, `region`, `time` and `resources` describe the schedule.
 * The Lambda `context` object provides metadata for the invocation.
 *
 * See https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents.html
 */
export default async function handleScheduled(event, context) {
  const invocation = collectInvocation(event, context, 'scheduled');
  logDebug('invocation', invocation);
  logDebug('handleScheduled', { time: event.time, requestId: context.awsRequestId });
  logDebug('Scheduled event at', event.time);
  return { processed: true };
}
