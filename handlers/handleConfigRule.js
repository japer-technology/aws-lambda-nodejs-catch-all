import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle AWS Config rule evaluations.
 *
 * Dispatch criteria: used when `event.invokingEvent`,
 * `event.ruleParameters` and `event.resultToken` are present.
 *
 * Available event fields:
 *  - `invokingEvent`: the configuration change that triggered the rule.
 *  - `ruleParameters`: custom parameters for the rule.
 *  - `resultToken`: token used when reporting evaluation results.
 * The standard Lambda `context` object is also provided.
 *
 * See https://docs.aws.amazon.com/config/latest/developerguide/evaluate-config_develop-rules_nodejs.html
 */
export default async function handleConfigRule(event, context) {
  const invocation = collectInvocation(event, context, 'configRule');
  logDebug('invocation', invocation);
  logDebug('handleConfigRule', { resultToken: event.resultToken, requestId: context.awsRequestId });
  logDebug('Config rule invoke', event.invokingEvent);
  return { complianceType: 'COMPLIANT', annotation: 'Default OK' };
}
