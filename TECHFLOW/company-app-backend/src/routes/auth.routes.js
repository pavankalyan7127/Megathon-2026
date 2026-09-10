import { Router } from 'express';
import { config } from '../config/index.js';

const router = Router();

export const ALLOWED_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'HR',
  'Project Manager',
  'Business Analyst',
  'Software Architect',
  'DevOps Engineer'
];

/**
 * GET /api/auth/roles
 * List of available company roles
 */
router.get('/roles', (req, res) => {
  res.json({ roles: ALLOWED_ROLES });
});

/**
 * POST /api/auth/login
 * Validates credentials against MockAPI
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Please provide both email and password.',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Fetch users from MockAPI
    const mockRes = await fetch(config.mockApiUrl);
    if (!mockRes.ok) {
      return res.status(502).json({
        error: 'Authentication service (MockAPI) is currently unavailable.',
        code: 'MOCKAPI_UNAVAILABLE'
      });
    }

    const users = await mockRes.json();
    const user = users.find(
      (u) => (u.email || '').toLowerCase() === trimmedEmail && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password. Please try again.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    return res.json({
      success: true,
      user: {
        id: String(user.id),
        name: user.Name || user.name || 'User',
        email: user.email,
        role: user.role || 'Frontend Developer'
      }
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Authentication failed due to an internal server error.',
      code: 'AUTH_ERROR'
    });
  }
});

/**
 * POST /api/auth/signup
 * Registers a new user on MockAPI
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: 'All fields (Name, Email, Password, Role) are required.',
        code: 'INCOMPLETE_DATA'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const mockRes = await fetch(config.mockApiUrl);
    if (mockRes.ok) {
      const existingUsers = await mockRes.json();
      if (Array.isArray(existingUsers)) {
        const found = existingUsers.some(
          (u) => (u.email || '').toLowerCase() === trimmedEmail
        );
        if (found) {
          return res.status(409).json({
            error: 'An account with this email already exists.',
            code: 'EMAIL_EXISTS'
          });
        }
      }
    }

    // Create user in MockAPI
    const createRes = await fetch(config.mockApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Name: name.trim(),
        email: trimmedEmail,
        password: password,
        role: role
      })
    });

    if (!createRes.ok) {
      return res.status(502).json({
        error: 'Failed to create account on MockAPI.',
        code: 'MOCKAPI_CREATE_ERROR'
      });
    }

    const createdUser = await createRes.json();

    return res.status(201).json({
      success: true,
      user: {
        id: String(createdUser.id),
        name: createdUser.Name || createdUser.name || name.trim(),
        email: createdUser.email,
        role: createdUser.role
      }
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Account creation failed due to an internal server error.',
      code: 'SIGNUP_ERROR'
    });
  }
});

export default router;
