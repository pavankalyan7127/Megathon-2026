import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  mockApiUrl: process.env.MOCKAPI_URL || 'https://6aa28cf8ccb3db9689a69eca.mockapi.io/login',
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || '',
  n8nTimeoutMs: parseInt(process.env.N8N_TIMEOUT_MS || '180000', 10),
};
