/**
 * Extracts the event source from the first record in the event.Records array.
 * Handles both 'eventSource' (lowercase, standard in most AWS events) and
 * 'EventSource' (uppercase, for backward compatibility with some AWS services).
 *
 * @param {Object} event - The AWS Lambda event object.
 * @returns {string|undefined} The event source string (e.g., 'aws:s3', 'aws:sns'), or undefined if not found.
 */
function getRecordsSource(event) {
  if (event.Records && Array.isArray(event.Records) && event.Records.length > 0) {
    return event.Records[0].eventSource || event.Records[0].EventSource;
  }
  return undefined;
}

/**
 * Ordered dispatch rules evaluated by the main handler.  Each rule provides a
 * `check` predicate to determine if an incoming event matches and the path to
 * the handler module responsible for processing that event type.  Rules are
 * evaluated sequentially until a match is found. Keep more specific shapes
 * before broader shapes so that a generic rule cannot shadow a specialized
 * handler.
 */
export default [
  { check: e => e.request && e.session && e.context?.System, handler: './handlers/handleAlexa.js' },
  { check: e => e.bot && e.userId && e.inputTranscript, handler: './handlers/handleLex.js' },
  { check: e => e.arguments && e.identity && e.info, handler: './handlers/handleAppSync.js' },
  { check: e => e.clientId && e.topic && e.payload, handler: './handlers/handleIoTRule.js' },
  { check: e => e.records && Array.isArray(e.records) && e.records[0]?.recordId, handler: './handlers/handleFirehose.js' },
  { check: e => e.invokingEvent && e.ruleParameters && e.resultToken, handler: './handlers/handleConfigRule.js' },
  { check: e => e.taskToken || e.source === 'aws.states', handler: './handlers/handleStepFunctions.js' },
  { check: e => e.version === '2.0' && e.requestContext?.routeKey && e.requestContext?.connectionId, handler: './handlers/handleWebSocket.js' },
  { check: e => e.type === 'TOKEN' && e.methodArn, handler: './handlers/handleAuthorizerV1.js' },
  { check: e => e.version === '2.0' && e.type === 'REQUEST', handler: './handlers/handleAuthorizerV2.js' },
  { check: e => e.version === '2.0' && e.requestContext?.http?.method, handler: './handlers/handleHttpV2.js' },
  { check: e => e.requestContext?.elb, handler: './handlers/handleAlb.js' },
  { check: e => e.httpMethod, handler: './handlers/handleHttpV1.js' },
  { check: e => e.Records && e.Records[0]?.cf, handler: './handlers/handleEdge.js' },
  { check: e => e.awslogs?.data, handler: './handlers/handleCloudWatchLogs.js' },
  { check: e => e.RequestType && e.ResponseURL, handler: './handlers/handleCustomResource.js' },
  { check: e => e.triggerSource && e.userPoolId, handler: './handlers/handleCognito.js' },
  { check: e => getRecordsSource(e) === 'aws:sqs', handler: './handlers/handleSqs.js' },
  { check: e => getRecordsSource(e) === 'aws:sns', handler: './handlers/handleSns.js' },
  { check: e => getRecordsSource(e) === 'aws:s3', handler: './handlers/handleS3.js' },
  { check: e => getRecordsSource(e) === 'aws:dynamodb', handler: './handlers/handleDynamoDB.js' },
  { check: e => getRecordsSource(e) === 'aws:kinesis', handler: './handlers/handleKinesis.js' },
  { check: e => getRecordsSource(e) === 'aws:ses', handler: './handlers/handleSes.js' },
  { check: e => e.eventSource === 'aws:kafka' || e.eventSource === 'SelfManagedKafka', handler: './handlers/handleKafka.js' },
  { check: e => e.eventSource === 'aws:amazonmq', handler: './handlers/handleAmazonMq.js' },
  { check: e => e.eventSource === 'aws:docdb', handler: './handlers/handleDocumentDb.js' },
  { check: e => e.source === 'aws.events', handler: './handlers/handleScheduled.js' },
  { check: e => e.source && e['detail-type'], handler: './handlers/handleEventBridge.js' },
];
