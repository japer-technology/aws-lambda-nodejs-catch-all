/**
 * Integration tests exercising the universal handler against representative
 * events for each supported AWS service.
 */
import { handler } from '../index.mjs';
import zlib from 'zlib';
import { jest } from '@jest/globals';

describe('handler dispatch', () => {
  test('handles Alexa event', async () => {
    const event = { request: { type: 'IntentRequest' }, session: { sessionId: 'abc' }, context: { System: {} } };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({
      version: '1.0',
      response: { outputSpeech: { type: 'PlainText', text: 'Hello from Alexa!' } }
    });
  });

  test('handles Lex event', async () => {
    const event = { bot: { name: 'TestBot' }, userId: 'u1', inputTranscript: 'hi' };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({
      sessionAttributes: {},
      dialogAction: {
        type: 'Close',
        fulfillmentState: 'Fulfilled',
        message: { contentType: 'PlainText', content: 'Hello from Lex!' }
      }
    });
  });

  test('handles AppSync event', async () => {
    const event = { arguments: {}, identity: {}, info: { fieldName: 'test' } };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toBeNull();
  });

  test('handles IoT Rule event', async () => {
    const event = { clientId: 'c1', topic: 'topic', payload: 'msg' };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ processed: true });
  });

  test('handles Firehose event', async () => {
    const event = { records: [ { recordId: '1', data: 'SGVsbG8=' } ] };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ records: [ { recordId: '1', result: 'Ok', data: 'SGVsbG8=' } ] });
  });

  test('handles Config Rule event', async () => {
    const event = { invokingEvent: '{}', ruleParameters: '{}', resultToken: 't' };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ complianceType: 'COMPLIANT', annotation: 'Default OK' });
  });

  test('handles Step Functions event', async () => {
    const event = { taskToken: 'tok', input: { foo: 'bar' } };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ status: 'SUCCEEDED', output: { foo: 'bar' } });
  });

  test('handles WebSocket event', async () => {
    const event = { version: '2.0', requestContext: { routeKey: '$default', connectionId: '1' } };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ statusCode: 200, body: 'WebSocket message received' });
  });

  test('handles Authorizer v1 event', async () => {
    const event = { type: 'TOKEN', methodArn: 'arn', authorizationToken: 'abc' };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{ Action: 'execute-api:Invoke', Effect: 'Deny', Resource: 'arn' }]
      }
    });
  });

  test('handles Authorizer v2 event', async () => {
    const event = { version: '2.0', type: 'REQUEST', routeArn: 'arn', requestContext: { http: { method: 'GET' } } };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ isAuthorized: false, context: {} });
  });

  test('handles HTTP API v2 event', async () => {
    const event = { version: '2.0', requestContext: { http: { method: 'GET' } }, rawPath: '/p', rawQueryString: '' };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello from API Gateway v2' })
    });
  });

  test('handles ALB event', async () => {
    const event = { requestContext: { elb: {} }, httpMethod: 'GET', path: '/alb' };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({
      statusCode: 200,
      statusDescription: '200 OK',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello from ALB' })
    });
  });

  test('handles Edge event', async () => {
    const request = { uri: '/index.html', method: 'GET', headers: {} };
    const event = { Records: [ { cf: { config: { eventType: 'viewer-request' }, request } } ] };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual(request);
  });

  test('handles malformed Edge event', async () => {
    const event = { Records: [ { cf: { config: { eventType: 'viewer-request' } } } ] };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ error: 'Invalid CloudFront event' });
  });

  test('falls back to default handler when cf missing', async () => {
    const event = { Records: [ {} ] };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ fallback: true });
  });

  test('handles CloudWatch Logs event', async () => {
    const payload = { messageType: 'DATA_MESSAGE', logEvents: [ { id: '1', timestamp: 0, message: 'hi' } ] };
    const data = zlib.gzipSync(JSON.stringify(payload)).toString('base64');
    const event = { awslogs: { data } };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual(payload.logEvents);
  });

  test('returns empty array on malformed CloudWatch Logs data', async () => {
    const data = Buffer.from('not gzipped').toString('base64');
    const event = { awslogs: { data } };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual([]);
  });

  test('falls back to default handler on empty CloudWatch Logs data', async () => {
    const event = { awslogs: { data: '' } };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ fallback: true });
  });

  test('handles Custom Resource event', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true });
    const event = { RequestType: 'Create', ResponseURL: 'https://example.com', StackId: 's', RequestId: 'r', LogicalResourceId: 'l' };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('https://example.com', expect.objectContaining({ method: 'PUT' }));
    fetchMock.mockRestore();
  });

  test('handles Cognito event', async () => {
    const event = { triggerSource: 'PreSignUp_SignUp', userPoolId: 'pool', userName: 'u', request: {}, response: {} };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual(event);
  });

  test('handles SQS event', async () => {
    const event = { Records: [ { eventSource: 'aws:sqs', messageId: '1', receiptHandle: 'rh', body: 'msg' } ] };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ processed: 1 });
  });

  test('handles SNS event', async () => {
    const event = { Records: [ { eventSource: 'aws:sns', Sns: { MessageId: '1', Message: 'msg' } } ] };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ processed: 1 });
  });

  test('handles DynamoDB event', async () => {
    const event = { Records: [ { eventSource: 'aws:dynamodb', eventID: '1', dynamodb: {} } ] };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ processed: 1 });
  });

  test('handles Kinesis event', async () => {
    const event = { Records: [ { eventSource: 'aws:kinesis', kinesis: { data: Buffer.from('hi').toString('base64') } } ] };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ processed: 1 });
  });

  test('handles SES event', async () => {
    const event = { Records: [ { eventSource: 'aws:ses', ses: { mail: { messageId: '1', source: 'a@b.com', commonHeaders: { subject: 'Hi' } }, receipt: {} } } ] };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ processed: 1 });
  });

  test('handles Amazon MSK events', async () => {
    const event = {
      eventSource: 'aws:kafka',
      records: { 'topic-0': [{ value: 'SGVsbG8=' }, { value: 'V29ybGQ=' }] },
    };
    const result = await handler(event, { awsRequestId: '1' });
    expect(result).toEqual({ processed: 2 });
  });

  test('handles self-managed Kafka events', async () => {
    const event = {
      eventSource: 'SelfManagedKafka',
      records: { 'topic-0': [{ value: 'SGVsbG8=' }] },
    };
    const result = await handler(event, { awsRequestId: '1' });
    expect(result).toEqual({ processed: 1 });
  });

  test('handles Amazon MQ events', async () => {
    const event = {
      eventSource: 'aws:amazonmq',
      messagesByQueue: { 'queue::/': [{ data: 'SGVsbG8=' }] },
    };
    const result = await handler(event, { awsRequestId: '1' });
    expect(result).toEqual({ processed: 1 });
  });

  test('handles Amazon DocumentDB events', async () => {
    const event = {
      eventSource: 'aws:docdb',
      events: [{ event: { operationType: 'insert' } }],
    };
    const result = await handler(event, { awsRequestId: '1' });
    expect(result).toEqual({ processed: 1 });
  });

  test('handles EventBridge event', async () => {
    const event = { source: 'aws.ec2', 'detail-type': 'EC2 Event', detail: {} };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ processed: true });
  });

  test('handles Scheduled event', async () => {
    const event = { source: 'aws.events', id: '1', 'detail-type': 'Scheduled Event', time: '2022-01-01T00:00:00Z' };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ processed: true });
  });

  test('handles Default event', async () => {
    const event = { some: 'value' };
    const context = { awsRequestId: '1' };
    const result = await handler(event, context);
    expect(result).toEqual({ fallback: true });
  });

  test('handles Records-based events with undefined Records gracefully', async () => {
    // Test that handlers are defensive against undefined Records
    // This tests the fix for the bug where handlers would crash on undefined Records
    const eventsWithUndefinedRecords = [
      { Records: undefined },
      { Records: null },
    ];
    
    for (const event of eventsWithUndefinedRecords) {
      const context = { awsRequestId: '1' };
      const result = await handler(event, context);
      // Should fall back to default handler since getRecordsSource returns undefined
      expect(result).toEqual({ fallback: true });
    }
  });

  test('returns 500 when a handler throws for HTTP events', async () => {
    await jest.isolateModulesAsync(async () => {
      const failingHandler = jest.fn(() => {
        throw new Error('boom');
      });
      jest.unstable_mockModule('../dispatcher.js', () => ({
        dispatchTablePromise: Promise.resolve([
          { check: () => true, handler: failingHandler },
        ]),
      }));
      const { handler } = await import('../index.mjs');
      const event = { httpMethod: 'GET', path: '/err' };
      const context = { awsRequestId: '1' };
      const result = await handler(event, context);
      expect(result).toEqual({
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
  });

  test('returns 500 when a handler throws for WebSocket events', async () => {
    await jest.isolateModulesAsync(async () => {
      const failingHandler = jest.fn(() => {
        throw new Error('boom');
      });
      jest.unstable_mockModule('../dispatcher.js', () => ({
        dispatchTablePromise: Promise.resolve([
          { check: e => e.requestContext?.routeKey, handler: failingHandler },
        ]),
      }));
      const { handler } = await import('../index.mjs');
      const event = { version: '2.0', requestContext: { routeKey: '$default', connectionId: '1' } };
      const context = { awsRequestId: '1' };
      const result = await handler(event, context);
      expect(result).toEqual({
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
  });
});
