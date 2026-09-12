import { Router, Request, Response } from 'express';

export const docsRouter = Router();

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Windows 11 OS Portfolio Production API',
    version: '2.0.0',
    description: 'RESTful API and Microservices powering Anish Jethva’s interactive Windows 11 Portfolio, featuring Authentication, Virtual File System, Contact and Email Service, Tasks Planner, and Real-time Analytics.',
    contact: {
      name: 'Anish Jethva',
      email: 'anish.jethva2006@gmail.com',
      url: 'https://github.com/anishjethva18',
    },
  },
  servers: [
    { url: '/api', description: 'Production API Gateway' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'System health check',
        responses: {
          200: { description: 'Service is healthy and responding' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'anish.jethva2006@gmail.com' },
                  password: { type: 'string', example: 'Admin@2026' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully with JWT token' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register new portfolio account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Alex Developer' },
                  email: { type: 'string', example: 'alex@example.com' },
                  password: { type: 'string', example: 'SecretPass123' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          201: { description: 'User account created' },
          400: { description: 'Validation error or email already in use' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get currently authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile details' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/contact': {
      post: {
        summary: 'Submit inquiry message and trigger email pipeline',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Recruiter / Client' },
                  email: { type: 'string', example: 'recruiter@tech.com' },
                  subject: { type: 'string', example: 'Project Collaboration Opportunity' },
                  message: { type: 'string', example: 'Hello Anish, loved your Windows 11 portfolio! Would love to chat.' },
                },
                required: ['name', 'email', 'subject', 'message'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Message received and processed' },
          400: { description: 'Validation failure' },
        },
      },
    },
    '/tasks': {
      get: {
        summary: 'List user tasks',
        responses: { 200: { description: 'Array of task items' } },
      },
      post: {
        summary: 'Create a new task item',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Review system security headers' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                  category: { type: 'string', enum: ['Work', 'Portfolio', 'Personal', 'Bug', 'Feature'] },
                  dueDate: { type: 'string', example: '2026-08-30' },
                },
                required: ['title'],
              },
            },
          },
        },
        responses: { 201: { description: 'Task created' } },
      },
    },
    '/analytics/dashboard': {
      get: {
        summary: 'Fetch real-time system metrics, active requests, memory, and uptime',
        responses: { 200: { description: 'Aggregated metrics object' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

/**
 * GET /api/docs/spec.json
 */
docsRouter.get('/spec.json', (req: Request, res: Response) => {
  res.json(openApiSpec);
});

/**
 * GET /api/docs (Interactive Swagger / Developer UI)
 */
docsRouter.get('/', (req: Request, res: Response) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Windows 11 Portfolio API Explorer</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; padding: 0; background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .topbar { background: #1e293b; padding: 14px 24px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; }
    .topbar h1 { margin: 0; font-size: 18px; color: #38bdf8; font-weight: 700; }
    .badge { background: #0284c7; color: #fff; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
  </style>
</head>
<body>
  <div class="topbar">
    <h1>Anish Jethva Portfolio — OpenAPI 3.0 API Gateway</h1>
    <span class="badge">v2.0.0 Production</span>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/docs/spec.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true
      });
    };
  </script>
</body>
</html>
  `;
  res.send(html);
});
