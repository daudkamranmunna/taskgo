import { Router } from 'express';
import { listBadges } from '../controllers/badges.controller.js';

const router = Router();

router.get('/', listBadges);

export default router;