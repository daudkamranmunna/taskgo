// The look of TaskGo. Change a color or size here and the whole app updates.

export const colors = {
  background: '#F6F7FB',
  primary: '#5B5BD6',
  primaryLight: '#EEF0FF',
  accent: '#FF8A3D', // the flame orange
  success: '#22C55E',
  danger: '#EF4444',
  text: '#1F2937',
  muted: '#6B7280',
  white: '#FFFFFF',
  border: '#E5E7EB',
  // one color per task priority
  priority: {
    low: '#9CA3AF', // gray
    medium: '#3B82F6', // blue
    high: '#FF8A3D', // orange
    exam: '#EF4444', // red
  },
};

// Gaps and padding, in pixels
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// How round the corners are
export const radius = {
  sm: 8,
  md: 14,
  lg: 16, // cards
  pill: 999,
};

export const fontSize = {
  small: 13,
  body: 16,
  title: 20,
  heading: 28,
  display: 40,
};

// A soft shadow for cards (works on both iPhone and Android)
export const shadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};