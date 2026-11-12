import { ok, fail } from '../utils/response.js';

// GET /api/quotes/random -> { text, author }
export async function getRandomQuote(req, res) {
  // 1. How many quotes are there?
  const { count, error: countError } = await req.supabase
    .from('quotes')
    .select('id', { count: 'exact', head: true });
  if (countError) throw countError;
  if (!count) return fail(res, 404, 'No quotes found');

  // 2. Pick a random position and fetch just that one quote
  const position = Math.floor(Math.random() * count);
  const { data, error } = await req.supabase
    .from('quotes')
    .select('text, author')
    .order('id', { ascending: true })
    .range(position, position);
  if (error) throw error;
  if (!data || data.length === 0) return fail(res, 404, 'No quotes found');

  return ok(res, data[0]);
}