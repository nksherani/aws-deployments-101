const http = require('http');
const url = require('url');
const { handleRequest } = require('./mockController');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const path = parsedUrl.pathname;
  const queryParams = parsedUrl.query;

  let bodyData = '';
  req.on('data', chunk => {
    bodyData += chunk;
  });

  req.on('end', () => {
    let parsedBody = null;
    if (bodyData) {
      try {
        parsedBody = JSON.parse(bodyData);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    }

    const response = handleRequest({
      method,
      path,
      queryParams,
      body: parsedBody
    });

    res.writeHead(response.statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });

    res.end(JSON.stringify(response.data, null, 2));
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 Mock API Server running locally on http://localhost:${PORT}`);
    console.log(`   GET  http://localhost:${PORT}/health`);
    console.log(`   GET  http://localhost:${PORT}/products`);
    console.log(`   POST http://localhost:${PORT}/products`);
  });
}

module.exports = server;
