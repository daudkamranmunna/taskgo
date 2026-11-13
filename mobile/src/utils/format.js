// Helpers that turn data into readable text or route addresses.

// 45 -> "45 min", 60 -> "1h", 75 -> "1h 15m"
export function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

// Seconds -> clock text for the timer: 65 -> "01:05", 3725 -> "1:02:05"
export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

// The route that opens the task form to EDIT a task.
// Route parameters can only be text, so empty values become ''.
export function taskFormHref(task) {
  return {
    pathname: '/task-form',
    params: {
      id: task.id,
      title: task.title,
      subject: task.subject,
      priority: task.priority,
      due_date: task.due_date || '',
      note: task.note || '',
    },
  };
}

// The route that opens the Timer for a task (the Timer reads these in Step 10)
export function timerHref(task) {
  return {
    pathname: '/(tabs)/timer',
    params: { taskId: task.id, taskTitle: task.title, subject: task.subject },
  };
}