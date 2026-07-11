/**
 * Load and map all available event handlers used by the universal Lambda
 * dispatcher.  Handlers are imported eagerly so that their references can be
 * resolved when building the dispatch table.
 */
import handleAlexa from './handlers/handleAlexa.js';
import handleLex from './handlers/handleLex.js';
import handleAppSync from './handlers/handleAppSync.js';
import handleIoTRule from './handlers/handleIoTRule.js';
import handleFirehose from './handlers/handleFirehose.js';
import handleConfigRule from './handlers/handleConfigRule.js';
import handleStepFunctions from './handlers/handleStepFunctions.js';
import handleWebSocket from './handlers/handleWebSocket.js';
import handleAuthorizerV1 from './handlers/handleAuthorizerV1.js';
import handleAuthorizerV2 from './handlers/handleAuthorizerV2.js';
import handleHttpV1 from './handlers/handleHttpV1.js';
import handleHttpV2 from './handlers/handleHttpV2.js';
import handleAlb from './handlers/handleAlb.js';
import handleEdge from './handlers/handleEdge.js';
import handleCloudWatchLogs from './handlers/handleCloudWatchLogs.js';
import handleCustomResource from './handlers/handleCustomResource.js';
import handleCognito from './handlers/handleCognito.js';
import handleSqs from './handlers/handleSqs.js';
import handleSns from './handlers/handleSns.js';
import handleS3 from './handlers/handleS3.js';
import handleDynamoDB from './handlers/handleDynamoDB.js';
import handleKinesis from './handlers/handleKinesis.js';
import handleSes from './handlers/handleSes.js';
import handleEventBridge from './handlers/handleEventBridge.js';
import handleScheduled from './handlers/handleScheduled.js';
import handleKafka from './handlers/handleKafka.js';
import handleAmazonMq from './handlers/handleAmazonMq.js';
import handleDocumentDb from './handlers/handleDocumentDb.js';

/**
 * Mapping of handler module paths to the concrete handler implementations.
 * The keys correspond to the `handler` values declared in dispatch-config.js.
 */
const handlerMap = {
  './handlers/handleAlexa.js': handleAlexa,
  './handlers/handleLex.js': handleLex,
  './handlers/handleAppSync.js': handleAppSync,
  './handlers/handleIoTRule.js': handleIoTRule,
  './handlers/handleFirehose.js': handleFirehose,
  './handlers/handleConfigRule.js': handleConfigRule,
  './handlers/handleStepFunctions.js': handleStepFunctions,
  './handlers/handleWebSocket.js': handleWebSocket,
  './handlers/handleAuthorizerV1.js': handleAuthorizerV1,
  './handlers/handleAuthorizerV2.js': handleAuthorizerV2,
  './handlers/handleHttpV1.js': handleHttpV1,
  './handlers/handleHttpV2.js': handleHttpV2,
  './handlers/handleAlb.js': handleAlb,
  './handlers/handleEdge.js': handleEdge,
  './handlers/handleCloudWatchLogs.js': handleCloudWatchLogs,
  './handlers/handleCustomResource.js': handleCustomResource,
  './handlers/handleCognito.js': handleCognito,
  './handlers/handleSqs.js': handleSqs,
  './handlers/handleSns.js': handleSns,
  './handlers/handleS3.js': handleS3,
  './handlers/handleDynamoDB.js': handleDynamoDB,
  './handlers/handleKinesis.js': handleKinesis,
  './handlers/handleSes.js': handleSes,
  './handlers/handleEventBridge.js': handleEventBridge,
  './handlers/handleScheduled.js': handleScheduled,
  './handlers/handleKafka.js': handleKafka,
  './handlers/handleAmazonMq.js': handleAmazonMq,
  './handlers/handleDocumentDb.js': handleDocumentDb,
};

/**
 * Resolve the dispatch configuration into executable handler functions.
 *
 * @returns {Promise<Array<{check: Function, handler: Function}>>} The dispatch
 * table, preserving the order defined in the configuration file.
 */
export async function loadDispatchTable() {
  const { default: config } = await import('./dispatch-config.js');
  return config.map(({ check, handler }) => {
    const fn = handlerMap[handler];
    if (!fn) throw new Error(`Unknown handler path: ${handler}`);
    return { check, handler: fn };
  });
}

/**
 * Promise that resolves to the dispatch table.  Loading is initiated on module
 * import so the table is available by the time the Lambda handler runs.
 */
export const dispatchTablePromise = loadDispatchTable();
