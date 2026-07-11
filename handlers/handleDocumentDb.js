import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle Amazon DocumentDB change stream event source mappings.
 *
 * See https://docs.aws.amazon.com/lambda/latest/dg/with-documentdb.html
 */
export default async function handleDocumentDb(event, context) {
  const invocation = collectInvocation(event, context, 'documentDb');
  logDebug('invocation', invocation);
  const processed = Array.isArray(event.events) ? event.events.length : 0;
  logDebug('handleDocumentDb', { processed, requestId: context.awsRequestId });
  return { processed };
}
