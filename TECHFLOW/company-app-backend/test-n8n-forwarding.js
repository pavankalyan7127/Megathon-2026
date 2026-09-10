import http from 'http';
import { forwardToN8N } from './src/services/n8n.service.js';

const TEST_PORT = 5899;

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    const received = JSON.parse(body);
    console.log('Mock n8n received query:', received.query);
    console.log('Mock n8n received role:', received.user.role);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      response: `[n8n Workflow Execution] Handled "${received.query}" for ${received.user.name} (${received.user.role}).`,
      status: 'executed',
      agent_plan: ['Inspect query', 'Evaluate intent', 'Proceed to Tripwire']
    }));
  });
});

server.listen(TEST_PORT, async () => {
  const { config } = await import('./src/config/index.js');
  config.n8nWebhookUrl = `http://localhost:${TEST_PORT}/webhook/demo`;

  console.log('Testing forwardToN8N() with active webhook...');
  const result = await forwardToN8N({
    user: { id: '42', name: 'Pavan', email: 'pavan@company.com', role: 'DevOps Engineer' },
    query: 'Prepare the database for deployment.',
    sessionId: 'sess_live_test'
  });

  console.log('Result status:', result.status);
  console.log('Result payload:', result.data);

  server.close(() => {
    console.log('✓ Webhook forwarding test completed successfully.');
  });
});
