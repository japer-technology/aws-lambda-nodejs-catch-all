import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle Amazon MSK and self-managed Apache Kafka event source mappings.
 *
 * See https://docs.aws.amazon.com/lambda/latest/dg/with-kafka.html
 */
export default async function handleKafka(event, context) {
  const invocation = collectInvocation(event, context, 'kafka');
  logDebug('invocation', invocation);
  const processed = Object.values(event.records ?? {}).reduce(
    (count, records) => count + (Array.isArray(records) ? records.length : 0),
    0,
  );
  logDebug('handleKafka', { processed, requestId: context.awsRequestId });
  return { processed };
}
