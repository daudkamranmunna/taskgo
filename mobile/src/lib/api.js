// The ONLY file that talks to the TaskGo backend (our Express server on Render).
// Screens call functions like api.getProfile() and never use fetch directly.
//
// Every function returns the "data" part of the reply, or throws an Error with a
// readable message (err.message) that a screen can show to the user.
import { API_URL } from '../constants/config';
import { getAccessToken } from './supabase';

// Render's free server can need about a minute to wake up after sleeping
const TIMEOUT_MS = 70000;

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Sends one request to the backend.
//   query: { today: '2026-11-12' }  ->  ?today=2026-11-12
//   body:  an object, sent as JSON
async function request(method, path, { query, body } = {}) {
  // 1. Who is logged in?
  const token = await getAccessToken();
  if (!token) throw new ApiError('You are not logged in.', 401);

  // 2. Build the address
  let url = `${API_URL}${path}`;
  if (query) {
    const parts = Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    if (parts.length > 0) url += `?${parts.join('&')}`;
  }

  // 3. Send it (giving up after TIMEOUT_MS)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    const message =
      err.name === 'AbortError'
        ? 'The server took too long to answer. Please try again.'
        : 'Could not reach the server. Please check your internet connection.';
    throw new ApiError(message, 0);
  } finally {
    clearTimeout(timer);
  }

  // 4. Read the reply: { data, error }
  let json = null;
  try {
    json = await response.json();
  } catch (err) {
    // the reply was not JSON; handled below
  }

  if (!response.ok || !json || json.error) {
    const message =
      json && json.error && json.error.message
        ? json.error.message
        : 'Something went wrong on the server.';
    throw new ApiError(message, response.status);
  }

  return json.data;
}

// One function per endpoint in docs/API.md.
// today is always the phone's own date: todayString() from utils/date.js
export const api = {
  // Profile
  getProfile: () => request('GET', '/api/profile'),
  updateProfile: (changes) => request('PUT', '/api/profile', { body: changes }),

  // Study sessions
  createSession: (session) => request('POST', '/api/sessions', { body: session }),
  updateSessionNote: (id, note) =>
    request('PUT', `/api/sessions/${id}`, { body: { note } }),
  getSessions: (limit = 50, offset = 0) =>
    request('GET', '/api/sessions', { query: { limit, offset } }),
  deleteSession: (id) => request('DELETE', `/api/sessions/${id}`),

  // Tasks (status: 'open' | 'done' | 'all')
  getTasks: (status, today) =>
    request('GET', '/api/tasks', { query: { status, today } }),
  getUpcomingTasks: (today) =>
    request('GET', '/api/tasks/upcoming', { query: { today } }),
  createTask: (task) => request('POST', '/api/tasks', { body: task }),
  updateTask: (id, changes) => request('PUT', `/api/tasks/${id}`, { body: changes }),
  deleteTask: (id) => request('DELETE', `/api/tasks/${id}`),

  // Stats
  getTodayStats: (today) => request('GET', '/api/stats/today', { query: { today } }),
  getStreak: (today) => request('GET', '/api/stats/streak', { query: { today } }),
  getWeekly: (today) => request('GET', '/api/stats/weekly', { query: { today } }),
  getXp: () => request('GET', '/api/stats/xp'),

  // Badges and quotes
  getBadges: () => request('GET', '/api/badges'),
  getRandomQuote: () => request('GET', '/api/quotes/random'),
};