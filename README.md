# aws-lambda-nodejs-catch-all

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) ![AI](https://img.shields.io/badge/Assisted-Development-2b2bff?logo=openai&logoColor=white) 

This project provides a universal AWS Lambda entry point implemented in Node.js. It inspects each incoming event and automatically routes it to the appropriate handler based on the invocation source.

A universal AWS Lambda entry point implemented in Node.js. It inspects each incoming event and automatically routes it to the appropriate handler based on the invocation source.Catch-all AWS Lambda (Node.js) function that receives, logs, and routes every AWS event trigger through a single, unified handler.

## Installation

Clone the repository and install the development dependencies used for
testing and linting:

```bash
npm install
```

This project requires **Node.js 20 or later**, as specified in
`package.json`.


## TypeScript

Type declaration files are included for all handlers. Run `npm run build` to regenerate them after making changes.

## Deployment

Zip the contents of the repository and upload them using the AWS CLI:

```bash
zip -r function.zip index.mjs handlers/
aws lambda create-function \
  --function-name universal-handler \
  --runtime nodejs20.x \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --role <role-arn>
```

To update an existing function:

```bash
zip -r function.zip index.mjs handlers/
aws lambda update-function-code \
  --function-name universal-handler \
  --zip-file fileb://function.zip
```

## Supported Event Sources

The handler recognizes and dispatches events from:

- Alexa Skills Kit
- Amazon Lex bots
- AWS AppSync (GraphQL resolvers)
- IoT Rules
- Kinesis Firehose data transformation
- AWS Config rules
- Step Functions tasks
- WebSocket APIs
- API Gateway authorizers (v1 and v2)
- API Gateway HTTP APIs (v1 and v2)
- Application Load Balancers
- Lambda@Edge
- CloudWatch Logs subscriptions
- CloudFormation custom resources
- Cognito triggers
- SQS, SNS, S3, DynamoDB Streams, Kinesis Streams, SES
- EventBridge / CloudWatch Events
- Scheduled events
- Fallback for other events

## Custom Dispatch Configuration

Handlers and event checks are listed in `dispatch-config.js`. Each entry
contains a `check` function that inspects the incoming event and a `handler`
module path. The dispatcher loads this file during initialization.

To add your own event type:

1. Create a new module under `handlers/` exporting a default async function.
2. Add an object to `dispatch-config.js` with your detection logic and handler
   path.

Example:

```js
// dispatch-config.js
export default [
  // existing entries...
  { check: e => e.myField === 'custom', handler: './handlers/handleMyEvent.js' },
];
```

### Example Event Payloads

HTTP API v1 request:

```json
{
  "httpMethod": "GET",
  "path": "/hello"
}
```

S3 event:

```json
{
  "Records": [
    {
      "eventSource": "aws:s3",
      "s3": {
        "bucket": { "name": "my-bucket" },
        "object": { "key": "file.txt" }
      }
    }
  ]
}
```

EventBridge event:

```json
{
  "source": "my.app",
  "detail-type": "example",
  "detail": {"key": "value"}
}
```

## Extending Handlers

Handler modules live in the `handlers/` folder and export a single async
function. A minimal handler looks like:

```js
export default async function handleSomething(event, context) {
  // your logic here
}
```

When a Lambda invocation occurs, [`index.mjs`](index.mjs) obtains the dispatch
table and executes the first handler whose `check` function matches the event:

```js
const dispatchTable = await dispatchTablePromise;
for (const { check, handler: h } of dispatchTable) {
  if (check(event)) {
    return await h(event, context);
  }
}
```

If no entry matches, `handleDefault.js` is called.

### Adding a new handler

1. Create a new file in `handlers/` exporting a default async function.
2. Import the file in `dispatcher.js` and add it to `handlerMap`.
3. Add a `check` entry in `dispatch-config.js` that returns `true` for your
   event type and references the handler path.
4. Add unit tests in `tests/` verifying the dispatch and response. Use existing
   cases in `tests/handlers.test.js` as a guide.
5. Run `npm test` to ensure all tests pass.

## Testing

Run the unit tests with:

```bash
npm test
```

## CLI Usage

Invoke the handler locally with a JSON event file:

```bash
npm run invoke -- examples/http-v1.json
```

Sample payloads for all supported sources live under the `examples/` directory.

## Contributing

Issues and pull requests are welcome. If adding new handlers or tests,
please follow the existing code style and include relevant documentation.

## Usage

After deploying, invoke the Lambda with your event payload. For example:

```bash
aws lambda invoke \
  --function-name universal-handler \
  --payload '{"httpMethod":"GET","path":"/"}' output.json
```

## Debugging

Set `DEBUG=1` (or any non-empty value) to enable additional log output. This can help troubleshoot event dispatching and handler execution.

When invocation data is collected, functions on the `context` object are invoked. If a context function throws an error, its message is captured and included in the logged context instead of halting execution.
