import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle API Gateway HTTP API authorizers (v2).
 *
 * Dispatch criteria: triggered when `event.version === '2.0'` and
 * `event.type === 'REQUEST'` are present.
 *
 * Available event fields:
 *  - `type` should be `'REQUEST'`.
 *  - `routeArn` and `identitySource` provide request metadata.
 *  - `requestContext.http.method` contains the HTTP method.
 * The Lambda `context` object is also available for metadata.
 *
 * This reference handler denies access until application-specific authorization
 * logic replaces it.
 *
 * See https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-lambda-authorizer.html
 */
export default async function handleAuthorizerV2(event, context) {
  const invocation = collectInvocation(event, context, 'authorizerV2');
  logDebug('invocation', invocation);
  logDebug('handleAuthorizerV2', { routeArn: event.routeArn, requestId: context.awsRequestId });
  return { isAuthorized: false, context: {} };
}
