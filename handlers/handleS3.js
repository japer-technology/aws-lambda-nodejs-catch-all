import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle Amazon S3 events.
 *
 * Dispatch criteria: chosen when `event.Records[0].eventSource` equals `'aws:s3'`.
 *
 * Available event fields:
 *  - `Records[].s3.bucket.name` and `arn` identify the bucket.
 *  - `Records[].s3.object.key`, `size` and `eTag` describe the object.
 * The Lambda `context` object provides invocation metadata.
 *
 * See https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html
 */
export default async function handleS3(event, context) {
  const invocation = collectInvocation(event, context, 's3');
  logDebug('invocation', invocation);
  logDebug('handleS3', { records: event.Records?.length, requestId: context.awsRequestId });
  event.Records?.forEach(r => logDebug('S3', { bucket: r.s3.bucket.name, key: r.s3.object.key }));
  return { processed: event.Records?.length || 0 };
}
