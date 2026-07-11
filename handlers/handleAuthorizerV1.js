import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle API Gateway custom authorizers (v1).
 *
 * Dispatch criteria: selected when `event.type === 'TOKEN'` and
 * `event.methodArn` are present.
 *
 * Available event fields:
 *  - `type` should be `'TOKEN'`.
 *  - `authorizationToken`: bearer token from the client.
 *  - `methodArn`: ARN of the API method being called.
 * The Lambda `context` object provides metadata such as `awsRequestId`.
 *
 * This reference handler denies access until application-specific authorization
 * logic replaces it.
 *
 * See https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
 */
export default async function handleAuthorizerV1(event, context) {
  const invocation = collectInvocation(event, context, 'authorizerV1');
  logDebug('invocation', invocation);
  logDebug('handleAuthorizerV1', { methodArn: event.methodArn, requestId: context.awsRequestId });
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{ Action: 'execute-api:Invoke', Effect: 'Deny', Resource: event.methodArn }],
    },
  };
}
