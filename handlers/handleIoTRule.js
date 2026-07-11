import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle AWS IoT Rule triggers.
 *
 * Dispatch criteria: used when `event.clientId`, `event.topic` and `event.payload` exist.
 *
 * Available event fields:
 *  - `clientId` and `principalId` identify the client.
 *  - `topic`: MQTT topic that triggered the rule.
 *  - `payload`: message payload.
 *  - `timestamp`: message timestamp.
 * The Lambda `context` object supplies invocation metadata.
 *
 * See https://docs.aws.amazon.com/lambda/latest/dg/services-iot.html
 */
export default async function handleIoTRule(event, context) {
  const invocation = collectInvocation(event, context, 'ioTRule');
  logDebug('invocation', invocation);
  logDebug('handleIoTRule', { topic: event.topic, requestId: context.awsRequestId });
  logDebug('IoT topic', event.topic);
  return { processed: true };
}
