const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Mock Products API",
    description: "Mock Products REST API designed for learning AWS deployment models (AWS CLI, SAM, Terraform, VS Code Toolkit, GitHub Actions, AWS CodePipeline).",
    version: "1.0.0"
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Node.js Development Server"
    },
    {
      url: "/",
      description: "AWS Lambda / API Gateway Environment"
    }
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health Check",
        description: "Returns health status of the API service",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "UP" },
                    service: { type: "string", example: "Mock Products API" },
                    environment: { type: "string", example: "development" },
                    awsRegion: { type: "string", example: "us-east-1" },
                    timestamp: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/products": {
      get: {
        summary: "List Products",
        description: "Retrieve a list of products with optional query filtering",
        parameters: [
          {
            name: "category",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter items by category (e.g. apparel, electronics)"
          },
          {
            name: "inStock",
            in: "query",
            required: false,
            schema: { type: "boolean" },
            description: "Filter items by in-stock availability"
          }
        ],
        responses: {
          "200": {
            description: "A JSON array of products",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    count: { type: "integer", example: 4 },
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" }
                    },
                    timestamp: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Create a Product",
        description: "Adds a new mock product to the in-memory catalog",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "price"],
                properties: {
                  name: { type: "string", example: "Serverless Mug" },
                  price: { type: "number", example: 19.99 },
                  category: { type: "string", example: "accessories" },
                  inStock: { type: "boolean", example: true }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Product created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Product created successfully" },
                    item: { $ref: "#/components/schemas/Product" }
                  }
                }
              }
            }
          },
          "400": {
            description: "Missing required fields or malformed payload"
          }
        }
      }
    },
    "/products/{id}": {
      get: {
        summary: "Get Product by ID",
        description: "Fetch a specific product record by its ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Product ID (e.g. prod-101)"
          }
        ],
        responses: {
          "200": {
            description: "Product found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    item: { $ref: "#/components/schemas/Product" }
                  }
                }
              }
            }
          },
          "404": {
            description: "Product not found"
          }
        }
      }
    },
    "/openapi.json": {
      get: {
        summary: "OpenAPI Specification",
        description: "Returns the complete OpenAPI 3.0.3 specification for this API",
        responses: {
          "200": {
            description: "OpenAPI JSON Specification"
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Product: {
        type: "object",
        properties: {
          id: { type: "string", example: "prod-101" },
          name: { type: "string", example: "Cloud Coffee Mug" },
          price: { type: "number", example: 14.99 },
          category: { type: "string", example: "accessories" },
          inStock: { type: "boolean", example: true }
        }
      }
    }
  }
};

module.exports = { openApiSpec };
