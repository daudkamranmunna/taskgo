import { Router } from 'express';
import {
  listTasks,
  getUpcomingTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/tasks.controller.js';

const router = Router();

router.get('/upcoming', getUpcomingTasks); // keep this above the /:id routes
router.get('/', listTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;