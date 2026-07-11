import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';
import zlib from 'zlib';

/**
 * Handle CloudWatch Logs subscription events.
 *
 * Dispatch criteria: this handler runs when `event.awslogs.data` is present.
 *
 * Available event fields:
 *  - `awslogs.data`: Base64 gzipped log payload.
 * The Lambda `context` object provides runtime information.
 *
 * See https://docs.aws.amazon.com/lambda/latest/dg/with-cloudwatch-logs.html#with-cloudwatch-logs-event
 */
export default async function handleCloudWatchLogs(event, context) {
  const invocation = collectInvocation(event, context, 'cloudWatchLogs');
  logDebug('invocation', invocation);
  logDebug('handleCloudWatchLogs', { requestId: context.awsRequestId });
  try {
    // Decode the base64 gzipped log payload
    const compressed = Buffer.from(event.awslogs.data, 'base64');
    const json = zlib.gunzipSync(compressed).toString('utf8');
    const payload = JSON.parse(json);
    payload.logEvents?.forEach(e => logDebug('CloudWatch', e.message));
    return payload.logEvents || [];
  } catch (err) {
    console.error('Failed to process CloudWatch Logs', err);
    return [];
  }
}
