// Mock items data store
const mockProducts = [
  { id: "prod-101", name: "Cloud Coffee Mug", price: 14.99, category: "accessories", inStock: true },
  { id: "prod-102", name: "DevOps Hoodie", price: 49.50, category: "apparel", inStock: true },
  { id: "prod-103", name: "Serverless Sticker Pack", price: 6.00, category: "stickers", inStock: false },
  { id: "prod-104", name: "Kubernetes Mechanical Keyboard", price: 120.00, category: "electronics", inStock: true }
];

// Reusable business logic controller
function handleRequest({ method, path, queryParams = {}, body = null }) {
  // Normalize path
  const cleanPath = path.replace(/^\/api/, '');

  // GET /products
  if (method === 'GET' && (cleanPath === '/products' || cleanPath === '/products/')) {
    let result = [...mockProducts];
    if (queryParams.category) {
      result = result.filter(p => p.category.toLowerCase() === queryParams.category.toLowerCase());
    }
    if (queryParams.inStock !== undefined) {
      const stockFilter = queryParams.inStock === 'true';
      result = result.filter(p => p.inStock === stockFilter);
    }
    return {
      statusCode: 200,
      data: {
        success: true,
        count: result.length,
        items: result,
        timestamp: new Date().toISOString()
      }
    };
  }

  // GET /products/:id
  const matchGetProduct = cleanPath.match(/^\/products\/([^/]+)$/);
  if (method === 'GET' && matchGetProduct) {
    const id = matchGetProduct[1];
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      return {
        statusCode: 404,
        data: { success: false, error: `Product with ID '${id}' not found` }
      };
    }
    return { statusCode: 200, data: { success: true, item: product } };
  }

  // POST /products
  if (method === 'POST' && (cleanPath === '/products' || cleanPath === '/products/')) {
    if (!body || !body.name || body.price === undefined) {
      return {
        statusCode: 400,
        data: { success: false, error: "Validation failed: 'name' and 'price' are required fields" }
      };
    }
    const newProduct = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      name: body.name,
      price: Number(body.price),
      category: body.category || "general",
      inStock: body.inStock !== undefined ? Boolean(body.inStock) : true
    };
    mockProducts.push(newProduct);
    return {
      statusCode: 201,
      data: { success: true, message: "Product created successfully", item: newProduct }
    };
  }

  // Health check endpoint
  if (method === 'GET' && (cleanPath === '/health' || cleanPath === '/' || cleanPath === '')) {
    return {
      statusCode: 200,
      data: {
        status: "UP",
        service: "Mock Products API",
        environment: process.env.NODE_ENV || "development",
        awsRegion: process.env.AWS_REGION || "local",
        docs: "/openapi.json",
        timestamp: new Date().toISOString()
      }
    };
  }

  // OpenAPI Specification endpoint
  if (method === 'GET' && (cleanPath === '/openapi.json' || cleanPath === '/swagger.json' || cleanPath === '/openapi')) {
    const { openApiSpec } = require('./openapi');
    return {
      statusCode: 200,
      data: openApiSpec
    };
  }

  return {
    statusCode: 404,
    data: { success: false, error: `Route not found for ${method} ${path}` }
  };
}

module.exports = {
  mockProducts,
  handleRequest
};
