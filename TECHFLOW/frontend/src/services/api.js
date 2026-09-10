const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

/**
 * Perform login via backend gateway
 */
export async function loginUser(email, password) {
  const res = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to authenticate user.');
  }
  return data.user;
}

/**
 * Perform registration via backend gateway
 */
export async function signupUser({ name, email, password, role }) {
  const res = await fetch(`${BACKEND_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create user account.');
  }
  return data.user;
}

/**
 * Send natural language query to backend gateway (which forwards to n8n)
 */
export async function sendAgentQuery({ user, query, sessionId }) {
  const res = await fetch(`${BACKEND_BASE_URL}/api/agent/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user,
      query,
      session_id: sessionId
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Backend gateway encountered an error.');
  }
  return data;
}

/**
 * Check backend health status
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/health`);
    if (!res.ok) return { healthy: false };
    return await res.json();
  } catch {
    return { healthy: false };
  }
}
