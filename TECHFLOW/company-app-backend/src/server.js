import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/auth.routes.js';
import agentRoutes from './routes/agent.routes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging (clean format)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'company-app-backend',
    version: '1.0.0',
    n8nConfigured: Boolean(config.n8nWebhookUrl && config.n8nWebhookUrl.trim()),
    mockApiConfigured: Boolean(config.mockApiUrl)
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agent', agentRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    error: 'Internal server error occurred.',
    code: 'INTERNAL_ERROR'
  });
});

app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 Company App Backend Gateway running on port ${config.port}`);
  console.log(`📡 MockAPI URL: ${config.mockApiUrl}`);
  console.log(`🔗 n8n Webhook: ${config.n8nWebhookUrl || '(not configured yet)'}`);
  console.log(`====================================================`);
});
