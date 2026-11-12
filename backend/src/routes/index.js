import { Router } from 'express';
import { ok } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Open route (no login needed). Used to check the server is alive.
router.get('/health', (req, res) => {
  return ok(res, { status: 'ok' });
});

// Everything under /api needs a valid login token.
router.use('/api', requireAuth);

// The /api routes (profile, sessions, tasks, ...) are added in Step 4.

export default router;