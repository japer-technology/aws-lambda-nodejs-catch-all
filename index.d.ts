/**
 * TypeScript definitions for the universal AWS Lambda handler package.
 */
import type { Context } from 'aws-lambda';

/** Generic AWS Lambda handler signature. */
export type LambdaHandler<Event = unknown, Result = unknown> =
  (event: Event, context: Context) => Promise<Result>;

/** Entrypoint exported by this package. */
export declare function handler(event: unknown, context: Context): Promise<unknown>;
export default handler;
