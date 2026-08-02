export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "RentNest - Gear Rental & Management Platform API Docs",
    version: "1.0.0",
    description:
      "API documentation map for the RentNest multi-role application platform core engines.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    "/api/auth/login": {
      post: {
        summary: "Authenticate user session credentials",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "customer@gmail.com" },
                  password: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Success" },
        },
      },
    },
  },
};
