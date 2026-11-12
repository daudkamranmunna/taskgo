import { fail } from '../utils/response.js';

// Runs when no route matched the request (wrong URL).
export function notFoundHandler(req, res) {
  return fail(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

// Runs when something throws an error anywhere in the app.
// Express recognises an error handler by its 4 parameters.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // The app sent broken JSON in the request body
  if (err.type === 'entity.parse.failed') {
    return fail(res, 400, 'Request body is not valid JSON');
  }

  // Anything else is our bug: log it for us, send a safe message to the app
  console.error(err);
  return fail(res, 500, 'Something went wrong on the server');
}