// Helpers so every API reply has the same shape:
//   success -> { data: ..., error: null }
//   failure -> { data: null, error: { message: "..." } }

// Send a success reply. status defaults to 200 (use 201 for "created").
export function ok(res, data, status = 200) {
  return res.status(status).json({ data, error: null });
}

// Send a failure reply with an HTTP status code and a readable message.
export function fail(res, status, message) {
  return res.status(status).json({ data: null, error: { message } });
}