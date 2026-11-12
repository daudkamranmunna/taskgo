// Starts the server. Run it with: npm run dev
// env.js is imported first: it checks that backend/.env is complete.
import { env } from './config/env.js';
import app from './app.js';

app.listen(env.port, () => {
  console.log(`TaskGo backend running on http://localhost:${env.port}`);
});