import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle Amazon Cognito User Pool triggers.
 *
 * Dispatch criteria: executed when `event.triggerSource` and
 * `event.userPoolId` are present.
 *
 * Available event fields:
 *  - `triggerSource`, `userPoolId` and `userName` identify the trigger.
 *  - `request` and `response` objects contain trigger data.
 * The Lambda `context` object includes metadata such as `awsRequestId`.
 *
 * See https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-trigger-syntax-shared.html
 */
export default async function handleCognito(event, context) {
  const invocation = collectInvocation(event, context, 'cognito');
  logDebug('invocation', invocation);
  logDebug('handleCognito', { trigger: event.triggerSource, requestId: context.awsRequestId });
  logDebug('Cognito trigger', event.triggerSource);
  return event;
}
