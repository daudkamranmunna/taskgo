import { Router } from 'express';
import {
  getToday,
  getStreak,
  getWeekly,
  getXp,
} from '../controllers/stats.controller.js';

const router = Router();

router.get('/today', getToday);
router.get('/streak', getStreak);
router.get('/weekly', getWeekly);
router.get('/xp', getXp);

export default router;