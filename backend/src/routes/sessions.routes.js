import { Router } from 'express';
import {
  createSession,
  updateSessionNote,
  listSessions,
  deleteSession,
} from '../controllers/sessions.controller.js';

const router = Router();

router.get('/', listSessions);
router.post('/', createSession);
router.put('/:id', updateSessionNote);
router.delete('/:id', deleteSession);

export default router;