import { Router } from 'express';
import { getRandomQuote } from '../controllers/quotes.controller.js';

const router = Router();

router.get('/random', getRandomQuote);

export default router;