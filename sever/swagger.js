import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Book Store API",
            version: "1.0.0",
            description: "RESTful API for managing books with JWT authentication",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Development server",
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
        tags: [
            {
                name: "Authentication",
                description: "User authentication endpoints",
            },
            {
                name: "Books",
                description: "Book management endpoints",
            },
        ],
    },
    apis: ["./apps/*.js"],
};

const specs = swaggerJsdoc(options);

export default specs;
