import { createAnonClient, createUserClient } from '../lib/supabase.js';
import { fail } from '../utils/response.js';

// Protects routes. The app must send:  Authorization: Bearer <access_token>
// On success it adds req.user and req.supabase for the route to use.
export async function requireAuth(req, res, next) {
  try {
    // 1. Read the token from the header
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      return fail(res, 401, 'Missing or invalid Authorization header');
    }

    // 2. Ask Supabase if the token belongs to a real, logged-in user
    const { data, error } = await createAnonClient().auth.getUser(token);

    if (error || !data || !data.user) {
      return fail(res, 401, 'Invalid or expired token');
    }

    // 3. Save the user and a user-level database connection on the request
    req.user = data.user;
    req.supabase = createUserClient(token);

    next();
  } catch (err) {
    next(err);
  }
}