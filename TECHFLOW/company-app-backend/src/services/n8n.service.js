import { config } from '../config/index.js';

/**
 * Determine action and resource from query
 */
function extractActionProposal(user, query) {
  const q = query.toLowerCase();
  let action = 'BACKEND_DB_GET';
  let resource = 'BACKEND_DB';

  if (user?.role === 'DevOps Engineer' || q.includes('devops') || q.includes('server') || q.includes('infra') || q.includes('deploy')) {
    resource = 'DEVOPS_DB';
    if (q.includes('delete') || q.includes('remove') || q.includes('drop')) {
      action = 'DEVOPS_DB_DELETE';
    } else if (q.includes('update') || q.includes('change') || q.includes('modify') || q.includes('set')) {
      action = 'DEVOPS_DB_UPDATE';
    } else if (q.includes('add') || q.includes('append') || q.includes('create') || q.includes('insert')) {
      action = 'DEVOPS_DB_APPEND';
    } else {
      action = 'DEVOPS_DB_GET';
    }
  } else {
    resource = 'BACKEND_DB';
    if (q.includes('delete') || q.includes('remove') || q.includes('drop')) {
      action = 'BACKEND_DB_DELETE';
    } else if (q.includes('update') || q.includes('change') || q.includes('modify') || q.includes('set')) {
      action = 'BACKEND_DB_UPDATE';
    } else if (q.includes('add') || q.includes('append') || q.includes('create') || q.includes('insert')) {
      action = 'BACKEND_DB_APPEND';
    } else {
      action = 'BACKEND_DB_GET';
    }
  }

  // Extract simple parameters if present
  const params = {};
  const idMatch = query.match(/C\d+/i);
  if (idMatch) params.customer_id = idMatch[0].toUpperCase();
  const nameMatch = query.match(/to\s+([A-Za-z\s]+)/i);
  if (nameMatch) params.name = nameMatch[1].trim();

  return { action, resource, parameters: params };
}

/**
 * Forward user natural-language query and role context to n8n webhook with Tripwire security evaluation
 */
export async function forwardToN8N({ user, query, sessionId }) {
  const currentSessionId = sessionId || 'sess_1_demo';
  const proposal = extractActionProposal(user, query);

  // 1. Mandatory Tripwire Security Harness Evaluation
  let tripwireDecision = null;
  const proposalPayload = {
    principal_id: user?.role || 'Backend Developer',
    session_id: currentSessionId,
    agent_id: 'techflow_gemini_agent',
    action: proposal.action,
    resource: proposal.resource,
    parameters: proposal.parameters
  };

  console.log('\n======================================================');
  console.log('🚀 [TECHFLOW -> TRIPWIRE] Forwarding proposal to security harness:');
  console.log('🔗 URL: POST http://localhost:8000/api/v1/actions/propose');
  console.log('📦 Proposal:', JSON.stringify(proposalPayload, null, 2));
  console.log('======================================================\n');

  try {
    const twRes = await fetch('http://localhost:8000/api/v1/actions/propose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposalPayload)
    });
    if (twRes.ok) {
      tripwireDecision = await twRes.json();
      console.log('🛡️ [TRIPWIRE -> TECHFLOW] Decision received:');
      console.log(JSON.stringify(tripwireDecision, null, 2));
      console.log('======================================================\n');
    } else {
      console.error(`⚠️ [TRIPWIRE ERROR] HTTP ${twRes.status}: ${twRes.statusText}`);
    }
  } catch (twErr) {
    console.warn('❌ [TRIPWIRE UNREACHABLE] Could not connect to Tripwire on port 8000:', twErr.message);
  }

  // If Tripwire intercepted with BLOCK or CONFIRM
  if (tripwireDecision) {
    if (tripwireDecision.decision === 'BLOCK') {
      console.log('⛔ [INTERCEPTED] Tripwire BLOCKED execution. Stopping workflow.');
      return {
        success: true,
        status: 'tripwire_blocked',
        data: `⛔ **Tripwire Security Harness: Action BLOCKED**\n- **Reason**: ${tripwireDecision.reason}\n- **Principal**: ${user?.role}\n- **Action**: ${proposal.action}\n- **Trajectory Risk**: ${tripwireDecision.risk_band} (${tripwireDecision.trajectory_score})`
      };
    }
    if (tripwireDecision.decision === 'CONFIRM' || tripwireDecision.decision === 'HARD_CONFIRM') {
      console.log('🔒 [INTERCEPTED] Tripwire HELD execution for Admin Confirmation. Stopping workflow.');
      return {
        success: true,
        status: 'tripwire_held',
        data: `🔒 **Tripwire Security Harness: Held for Administrator Confirmation**\n- **Action**: ${proposal.action} (${proposal.resource})\n- **Risk Band**: ${tripwireDecision.risk_band} | Trajectory Score: ${tripwireDecision.trajectory_score}\n- **Reason**: ${tripwireDecision.reason}\n\n*Please review and approve this action on the Tripwire Security Dashboard (http://localhost:5173).*`
      };
    }
    console.log('✅ [ALLOWED] Tripwire ALLOWED action. Proceeding to n8n database execution...\n');
  }

  const webhookUrl = config.n8nWebhookUrl;

  const payload = {
    user: {
      id: user?.id || 'unknown',
      name: user?.name || 'Anonymous Employee',
      email: user?.email || '',
      role: user?.role || 'Employee'
    },
    query: query.trim(),
    source: 'company-app',
    timestamp: new Date().toISOString(),
    session_id: currentSessionId
  };

  // If webhook is not configured yet
  if (!webhookUrl || webhookUrl.trim() === '') {
    return {
      success: false,
      status: 'not_configured',
      message: 'n8n webhook URL is not configured in backend environment (N8N_WEBHOOK_URL). Ready for workflow connection.',
      payloadSent: payload
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.n8nTimeoutMs);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        status: 'webhook_error',
        statusCode: res.status,
        message: `n8n webhook returned status ${res.status} (${res.statusText || 'Error'}).`
      };
    }

    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { response: text };
    }

    return {
      success: true,
      status: 'delivered',
      data: data
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        success: false,
        status: 'timeout',
        message: `Request to n8n webhook timed out after ${config.n8nTimeoutMs / 1000}s.`
      };
    }
    return {
      success: false,
      status: 'unreachable',
      message: 'Could not connect to n8n webhook server. Please verify n8n is running and reachable.'
    };
  }
}

/**
 * Execute an admin-approved action directly on n8n
 */
export async function executeConfirmedAction({ action_id, proposal, approved_by }) {
  const webhookUrl = config.n8nWebhookUrl;
  if (!webhookUrl || webhookUrl.trim() === '') {
    return { success: false, message: 'n8n Webhook URL is not configured' };
  }

  const payload = {
    user: {
      id: 'admin',
      name: approved_by || 'Security Administrator',
      email: 'admin@techflow.com',
      role: proposal?.principal_id || 'Backend Developer'
    },
    query: `Execute confirmed ${proposal?.action || 'action'} for target ${proposal?.resource || 'database'}: ${JSON.stringify(proposal?.parameters || {})}`,
    source: 'tripwire-hitl-approval',
    approved_by: approved_by || 'Security Administrator',
    timestamp: new Date().toISOString(),
    session_id: proposal?.session_id || 'sess_1_demo',
    is_pre_approved: true
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.n8nTimeoutMs);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = { response: await res.text() };
    }
    return { success: true, data };
  } catch (err) {
    clearTimeout(timeoutId);
    return { success: false, error: err.message };
  }
}
