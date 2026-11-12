import { Router } from 'express';
import { ok } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';
import profileRoutes from './profile.routes.js';
import sessionsRoutes from './sessions.routes.js';
import tasksRoutes from './tasks.routes.js';
import statsRoutes from './stats.routes.js';
import badgesRoutes from './badges.routes.js';
import quotesRoutes from './quotes.routes.js';

const router = Router();

// Open route (no login needed). Used to check the server is alive.
router.get('/health', (req, res) => {
  return ok(res, { status: 'ok' });
});

// Everything under /api needs a valid login token.
router.use('/api', requireAuth);

router.use('/api/profile', profileRoutes);
router.use('/api/sessions', sessionsRoutes);
router.use('/api/tasks', tasksRoutes);
router.use('/api/stats', statsRoutes);
router.use('/api/badges', badgesRoutes);
router.use('/api/quotes', quotesRoutes);

export default router;