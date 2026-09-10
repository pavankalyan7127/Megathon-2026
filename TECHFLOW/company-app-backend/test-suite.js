// test-suite.js - Integration verification for Company App Backend & MockAPI
import { config } from './src/config/index.js';

async function runTests() {
  console.log('--- Starting Integration Test Suite ---');
  const baseUrl = 'http://localhost:4000';

  // 1. Test Health
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    console.log('✓ Health Endpoint:', data.status === 'healthy' ? 'PASS' : 'FAIL', data);
  } catch (e) {
    console.error('✗ Health Check failed:', e.message);
  }

  // 2. Test MockAPI User Creation (Signup)
  const testEmail = `demo.tester.${Date.now()}@company.com`;
  let testUser = null;
  try {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Demo Tester',
        email: testEmail,
        password: 'password123',
        role: 'Backend Developer'
      })
    });
    const data = await res.json();
    if (res.ok && data.user) {
      testUser = data.user;
      console.log('✓ Signup via MockAPI: PASS', testUser);
    } else {
      console.error('✗ Signup failed:', data);
    }
  } catch (e) {
    console.error('✗ Signup error:', e.message);
  }

  // 3. Test MockAPI Login
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    const data = await res.json();
    if (res.ok && data.user && data.user.role === 'Backend Developer') {
      console.log('✓ Login via MockAPI: PASS', data.user);
    } else {
      console.error('✗ Login failed:', data);
    }
  } catch (e) {
    console.error('✗ Login error:', e.message);
  }

  // 4. Test AI Agent Query Endpoint
  try {
    const res = await fetch(`${baseUrl}/api/agent/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: testUser || { id: '1', name: 'Demo Tester', email: testEmail, role: 'Backend Developer' },
        query: 'Read the customer records.',
        session_id: 'sess_test_123'
      })
    });
    const data = await res.json();
    console.log('✓ Agent Query Endpoint: PASS', data);
  } catch (e) {
    console.error('✗ Agent Query failed:', e.message);
  }

  // 5. Clean up created test user from MockAPI if possible
  if (testUser && testUser.id) {
    try {
      await fetch(`${config.mockApiUrl}/${testUser.id}`, { method: 'DELETE' });
      console.log('✓ Cleaned up test record #', testUser.id);
    } catch (e) {
      console.warn('Could not clean up test record:', e.message);
    }
  }

  console.log('--- Test Suite Completed ---');
}

runTests();
