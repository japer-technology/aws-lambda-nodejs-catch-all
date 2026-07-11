import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle Amazon SES inbound email events.
 *
 * Dispatch criteria: executed when `event.Records[0].eventSource` equals `'aws:ses'`.
 *
 * Available event fields:
 *  - `Records[].ses.mail.messageId`, `source` and `destination`.
 *  - `Records[].ses.mail.commonHeaders.subject`, `from`, `to` and `date`.
 *  - `Records[].ses.receipt` verdicts and action.
 * The Lambda `context` object is available for invocation metadata.
 *
 * See https://docs.aws.amazon.com/ses/latest/dg/receiving-email-action-lambda.html
 */
export default async function handleSes(event, context) {
  const invocation = collectInvocation(event, context, 'ses');
  logDebug('invocation', invocation);
  logDebug('handleSes', { messages: event.Records?.length, requestId: context.awsRequestId });
  event.Records?.forEach(r => {
    logDebug('SES from', r.ses.mail.source);
    logDebug('SES subject', r.ses.mail.commonHeaders.subject);
  });
  return { processed: event.Records?.length || 0 };
}
