const { handleRequest } = require('./mockController');

/**
 * AWS Lambda Handler compatible with:
 * - API Gateway REST API (Payload v1)
 * - API Gateway HTTP API (Payload v2)
 * - Lambda Function URLs
 * - Direct test invocations
 */
exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  // Determine HTTP Method
  const method = (
    event.httpMethod ||
    (event.requestContext && event.requestContext.http && event.requestContext.http.method) ||
    'GET'
  ).toUpperCase();

  // Determine Path
  const path = (
    event.path ||
    (event.rawPath) ||
    '/'
  );

  // Extract Query String Parameters
  const queryParams = event.queryStringParameters || {};

  // Extract & parse body
  let body = null;
  if (event.body) {
    try {
      const rawBody = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('utf8')
        : event.body;
      body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    } catch (err) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Malformed JSON body' })
      };
    }
  }

  // Handle route logic
  const result = handleRequest({ method, path, queryParams, body });

  return {
    statusCode: result.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'X-Powered-By': 'AWS Lambda'
    },
    body: JSON.stringify(result.data)
  };
};
