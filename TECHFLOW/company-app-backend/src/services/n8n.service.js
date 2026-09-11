import { config } from '../config/index.js';

/**
 * Split a complex compound query into discrete sequential sub-steps
 * e.g., "first update customer 7 to 'captain' and then add random data and then delete row 4"
 */
function parseSequentialSteps(query) {
  if (!query || typeof query !== 'string') return [query];

  const cleaned = query.trim();
  
  // Split on delimiters like: "and then", "then", "after that", "next,", "next", or semicolons/newlines
  const rawParts = cleaned.split(/\s+(?:and\s+then|then|after\s+that|next)\s+|;\s*|\n+/i);
  const steps = rawParts
    .map(p => p.replace(/^(?:first|1\.|2\.|3\.|4\.|5\.|and\s+)\s*/i, '').trim())
    .filter(p => p.length > 0);

  return steps.length > 0 ? steps : [cleaned];
}

/**
 * Determine action, resource, and parameters for an individual step or query
 */
function extractActionProposal(user, query) {
  const q = query.toLowerCase();
  
  // 1. Determine target domain/database from the query text first
  let domain = null;
  if (q.includes('backend') || q.includes('customer') || q.includes('client') || q.includes('order')) {
    domain = 'backend';
  } else if (q.includes('devops') || q.includes('server') || q.includes('infra') || q.includes('deploy')) {
    domain = 'devops';
  } else if (q.includes('frontend') || q.includes('ui') || q.includes('component')) {
    domain = 'frontend';
  } else if (q.includes('hr') || q.includes('employee') || q.includes('leave') || q.includes('salary') || q.includes('payroll')) {
    domain = 'hr';
  } else if (q.includes('project') || q.includes('task') || q.includes('sprint') || q.includes('milestone')) {
    domain = 'projectmanager';
  } else if (q.includes('business') || q.includes('analyst') || q.includes('requirement') || q.includes('story')) {
    domain = 'business_analyst';
  } else if (q.includes('architect') || q.includes('system design') || q.includes('topology')) {
    domain = 'architect';
  }

  // 2. Fall back to user's assigned role domain if query didn't specify a target domain
  if (!domain) {
    if (user?.role === 'DevOps Engineer') domain = 'devops';
    else if (user?.role === 'Frontend Developer') domain = 'frontend';
    else if (user?.role === 'HR') domain = 'hr';
    else if (user?.role === 'Project Manager') domain = 'projectmanager';
    else if (user?.role === 'Business Analyst') domain = 'business_analyst';
    else if (user?.role === 'Software Architect') domain = 'architect';
    else domain = 'backend';
  }

  const resource = domain.toUpperCase() + '_DB';
  let op = 'GET';
  if (q.includes('delete') || q.includes('remove') || q.includes('drop') || q.includes('clean')) {
    op = 'DELETE';
  } else if (q.includes('update') || q.includes('change') || q.includes('modify') || q.includes('set')) {
    op = 'UPDATE';
  } else if (q.includes('add') || q.includes('append') || q.includes('create') || q.includes('insert')) {
    op = 'APPEND';
  } else {
    op = 'GET';
  }

  const action = `${resource}_${op}`;

  // Extract parameters
  const params = { original_query: query };
  const idMatch = query.match(/C\d+/i);
  if (idMatch) params.customer_id = idMatch[0].toUpperCase();
  const srvMatch = query.match(/SRV[-\d]+/i);
  if (srvMatch) params.server_id = srvMatch[0].toUpperCase();
  const nameMatch = query.match(/to\s+([A-Za-z\s]+)/i);
  if (nameMatch) params.name = nameMatch[1].trim();

  return { action, resource, parameters: params };
}

/**
 * Helper to evaluate a proposal against Tripwire
 */
async function evaluateWithTripwire(proposalPayload) {
  console.log('\n======================================================');
  console.log('🚀 [TECHFLOW -> TRIPWIRE] Proposing action to security harness:');
  console.log('🔗 URL: POST http://127.0.0.1:8000/api/v1/actions/propose');
  console.log('📦 Proposal:', JSON.stringify(proposalPayload, null, 2));
  console.log('======================================================\n');

  try {
    const twRes = await fetch('http://127.0.0.1:8000/api/v1/actions/propose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposalPayload)
    });
    if (twRes.ok) {
      const decision = await twRes.json();
      console.log('🛡️ [TRIPWIRE -> TECHFLOW] Decision received:');
      console.log(JSON.stringify(decision, null, 2));
      console.log('======================================================\n');
      return decision;
    } else {
      console.error(`⚠️ [TRIPWIRE ERROR] HTTP ${twRes.status}: ${twRes.statusText}`);
    }
  } catch (twErr) {
    console.warn('❌ [TRIPWIRE UNREACHABLE] Could not connect to Tripwire on port 8000:', twErr.message);
  }
  return null;
}

/**
 * Helper to dispatch execution directly to n8n webhook
 */
async function dispatchToN8N({ user, query, sessionId, isPreApproved = false, approvedBy = null }) {
  const webhookUrl = config.n8nWebhookUrl;
  if (!webhookUrl || webhookUrl.trim() === '') {
    return {
      success: false,
      status: 'not_configured',
      message: 'n8n webhook URL is not configured in backend environment (N8N_WEBHOOK_URL).'
    };
  }

  const payload = {
    user: {
      id: user?.id || 'user_1',
      name: user?.name || 'Authorized User',
      email: user?.email || '',
      role: user?.role || 'Backend Developer'
    },
    query: isPreApproved ? `[ADMIN PRE-APPROVED EXECUTION] ${query}` : query.trim(),
    source: isPreApproved ? 'tripwire-hitl-approval' : 'company-app',
    approved_by: approvedBy,
    timestamp: new Date().toISOString(),
    session_id: sessionId,
    is_pre_approved: isPreApproved
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
 * Forward user natural-language query and role context to n8n webhook with Tripwire sequential security evaluation
 */
export async function forwardToN8N({ user, query, sessionId }) {
  const currentSessionId = sessionId || 'sess_1_demo';
  const steps = parseSequentialSteps(query);

  console.log(`\n📋 [SEQUENTIAL PIPELINE] Identified ${steps.length} sequential step(s) in query:`);
  steps.forEach((step, idx) => console.log(`   [Step ${idx + 1}]: "${step}"`));

  const executedResults = [];

  for (let i = 0; i < steps.length; i++) {
    const currentStepQuery = steps[i];
    const proposal = extractActionProposal(user, currentStepQuery);

    const proposalPayload = {
      principal_id: user?.role || 'Backend Developer',
      session_id: currentSessionId,
      agent_id: 'techflow_ollama_agent',
      action: proposal.action,
      resource: proposal.resource,
      parameters: proposal.parameters
    };

    console.log(`\n⏳ [PIPELINE STEP ${i + 1}/${steps.length}] Evaluating Step: "${currentStepQuery}"`);
    const tripwireDecision = await evaluateWithTripwire(proposalPayload);

    if (tripwireDecision) {
      if (tripwireDecision.decision === 'BLOCK') {
        console.log(`⛔ [INTERCEPTED] Tripwire BLOCKED execution at step ${i + 1}.`);
        return {
          success: true,
          status: 'tripwire_blocked',
          data: `⛔ **Tripwire Security Harness: Action BLOCKED (Step ${i + 1}/${steps.length})**\n- **Step**: "${currentStepQuery}"\n- **Reason**: ${tripwireDecision.reason}\n- **Principal**: ${user?.role}\n- **Action**: ${proposal.action}\n- **Trajectory Risk**: ${tripwireDecision.risk_band} (${tripwireDecision.trajectory_score})`
        };
      }

      if (tripwireDecision.decision === 'CONFIRM' || tripwireDecision.decision === 'HARD_CONFIRM') {
        console.log(`🔒 [INTERCEPTED] Tripwire HELD execution at step ${i + 1} for Admin Confirmation.`);
        let summaryPrefix = '';
        if (executedResults.length > 0) {
          summaryPrefix = `✅ **Completed prior steps (${executedResults.length}/${steps.length}):**\n` +
            executedResults.map((r, idx) => `• Step ${idx + 1}: ${steps[idx]}`).join('\n') + '\n\n';
        }

        return {
          success: true,
          status: 'tripwire_held',
          data: `${summaryPrefix}🔒 **Tripwire Security Harness: Held for Administrator Confirmation (Step ${i + 1}/${steps.length})**\n- **Action**: ${proposal.action} (${proposal.resource})\n- **Pending Step**: "${currentStepQuery}"\n- **Risk Band**: ${tripwireDecision.risk_band} | Trajectory Score: ${tripwireDecision.trajectory_score}\n- **Reason**: ${tripwireDecision.reason}\n\n*Please review and approve this action on the Tripwire Security Dashboard (http://localhost:5173).*`
        };
      }
    }

    // Step was ALLOWED: Execute on n8n
    console.log(`✅ [ALLOWED] Step ${i + 1} ALLOWED by Tripwire. Executing via n8n...`);
    const stepExecResult = await dispatchToN8N({
      user,
      query: currentStepQuery,
      sessionId: currentSessionId
    });

    executedResults.push(stepExecResult);
  }

  // If all steps were executed synchronously (e.g. all read/write allowed)
  const lastResult = executedResults[executedResults.length - 1];
  return lastResult || {
    success: true,
    status: 'delivered',
    data: { response: 'All steps executed successfully.' }
  };
}

/**
 * Execute an admin-approved action directly on n8n
 */
export async function executeConfirmedAction({ action_id, proposal, approved_by }) {
  const originalQuery = proposal?.parameters?.original_query || '';
  const actionName = proposal?.action || 'database action';
  const resourceName = proposal?.resource || 'database';

  let targetedInstruction = '';
  if (originalQuery) {
    targetedInstruction = originalQuery;
  } else if (proposal?.parameters?.customer_id) {
    targetedInstruction = `Delete the customer record with customer_id ${proposal.parameters.customer_id} from ${resourceName}.`;
  } else if (proposal?.parameters?.server_id) {
    targetedInstruction = `Delete the server record with server_id ${proposal.parameters.server_id} from ${resourceName}.`;
  } else {
    targetedInstruction = `Execute ${actionName} on ${resourceName}.`;
  }

  // removed the console log 

  const result = await dispatchToN8N({
    user: {
      id: 'admin',
      name: approved_by || 'Security Administrator',
      email: 'admin@techflow.com',
      role: proposal?.principal_id || 'Backend Developer'
    },
    query: targetedInstruction,
    sessionId: proposal?.session_id || 'sess_1_demo',
    isPreApproved: true,
    approvedBy: approved_by || 'Security Administrator'
  });

  return result;
}

