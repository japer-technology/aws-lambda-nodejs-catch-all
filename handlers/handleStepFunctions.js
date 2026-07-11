import { logDebug } from '../logger.js';
import collectInvocation from '../collectInvocation.js';

/**
 * Handle AWS Step Functions task invocations.
 *
 * Dispatch criteria: selected when the event contains a `taskToken`
 * or when `event.source` equals `'aws.states'`.
 *
 * Available event fields include:
 *  - `taskToken`: token used for callback patterns.
 *  - `input` or `Execution.Input`: payload passed to the task.
 *  - Context objects under `Execution` and `Task` when Payload.$ is used.
 * The Lambda `context` object is also available during invocation.
 *
 * Example callback payload (waitForTaskToken):
 * {
 *   "taskToken": "token",
 *   "input": { ... }
 * }
 *
 * Example context object payload (Payload.$ == "$$"):
 * {
 *   "source": "aws.states",
 *   "Execution": { "Input": { ... } },
 *   "Task": { "Token": "token" }
 * }
 */
export default async function handleStepFunctions(event, context) {
  const invocation = collectInvocation(event, context, 'stepFunctions');
  logDebug('invocation', invocation);
  logDebug('handleStepFunctions', { requestId: context.awsRequestId });
  const input = event.input ?? event.Execution?.Input ?? event;
  logDebug('StepFunctions input', input);
  return { status: 'SUCCEEDED', output: input };
}
