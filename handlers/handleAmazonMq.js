import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle Amazon MQ event source mappings for ActiveMQ and RabbitMQ.
 *
 * See https://docs.aws.amazon.com/lambda/latest/dg/with-mq.html
 */
export default async function handleAmazonMq(event, context) {
  const invocation = collectInvocation(event, context, 'amazonMq');
  logDebug('invocation', invocation);
  const processed = Object.values(event.messagesByQueue ?? {}).reduce(
    (count, messages) => count + (Array.isArray(messages) ? messages.length : 0),
    0,
  );
  logDebug('handleAmazonMq', { processed, requestId: context.awsRequestId });
  return { processed };
}
