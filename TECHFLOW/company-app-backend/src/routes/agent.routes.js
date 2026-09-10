import { Router } from 'express';
import { forwardToN8N, executeConfirmedAction } from '../services/n8n.service.js';

const router = Router();

/**
 * POST /api/agent/query
 * Receives natural-language query from frontend and forwards with user context to n8n webhook
 */
router.post('/query', async (req, res) => {
  try {
    const { user, query, session_id } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request: Query cannot be empty.',
        code: 'EMPTY_QUERY'
      });
    }

    if (!user || !user.role) {
      return res.status(400).json({
        error: 'Invalid request: User profile and role context are required.',
        code: 'MISSING_USER_CONTEXT'
      });
    }

    const result = await forwardToN8N({
      user,
      query,
      sessionId: session_id
    });

    if (result.success) {
      return res.json({
        status: 'success',
        data: result.data,
        receivedQuery: query,
        timestamp: new Date().toISOString()
      });
    } else {
      // Return 200 with structured status so frontend displays clean informative message
      return res.json({
        status: result.status, // 'not_configured' | 'timeout' | 'unreachable' | 'webhook_error'
        message: result.message,
        payloadSent: result.payloadSent,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'An internal gateway error occurred while processing your request.',
      code: 'GATEWAY_ERROR'
    });
  }
});

/**
 * POST /api/agent/execute-confirmed
 * Receives admin-approved execution confirmation from Tripwire Dashboard and triggers n8n
 */
router.post('/execute-confirmed', async (req, res) => {
  try {
    const { action_id, proposal, approved_by } = req.body;
    console.log(`\n🚀 [TRIPWIRE ADMIN HITL] Executing confirmed action: ${proposal?.action} (Approved by: ${approved_by})`);
    
    const result = await executeConfirmedAction({
      action_id,
      proposal,
      approved_by
    });

    return res.json({
      status: result.success ? 'success' : 'error',
      result: result.data || result.message || result.error,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error executing confirmed action:', error);
    return res.status(500).json({
      error: 'Failed to execute confirmed action',
      code: 'EXECUTION_ERROR'
    });
  }
});

export default router;
