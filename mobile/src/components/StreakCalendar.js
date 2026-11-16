// The 28-day streak calendar, laid out in weeks (Monday to Sunday).
// days: [{ date: '2026-11-12', minutes: 35, active: true }, ...]  oldest first, last = today.
// It only DISPLAYS what the backend sent. The backend decides what is "active".
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// "2026-11-12" -> 0 for Monday ... 6 for Sunday
function weekdayIndex(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return (new Date(year, month - 1, day).getDay() + 6) % 7;
}

export default function StreakCalendar({ days }) {
  if (!days || days.length === 0) return null;

  // Empty cells before the first day (so each day sits under its weekday)
  // and after the last day (to finish the last row)
  const cells = [];
  for (let i = 0; i < weekdayIndex(days[0].date); i += 1) cells.push(null);
  days.forEach((day) => cells.push(day));
  while (cells.length % 7 !== 0) cells.push(null);

  const todayDate = days[days.length - 1].date;

  return (
    <View>
      <View style={styles.row}>
        {WEEKDAY_LETTERS.map((letter, index) => (
          <View key={index} style={styles.cell}>
            <Text style={styles.letter}>{letter}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (!day) return <View key={index} style={styles.cell} />;

          const isToday = day.date === todayDate;
          const dayNumber = Number(day.date.slice(8, 10));
          let circleStyle = styles.none;
          let textColor = colors.muted;
          if (day.active) {
            circleStyle = styles.active;
            textColor = colors.white;
          } else if (day.minutes > 0) {
            circleStyle = styles.some;
            textColor = colors.primary;
          }

          return (
            <View key={index} style={styles.cell}>
              <View style={[styles.circle, circleStyle, isToday && styles.today]}>
                <Text style={[styles.dayNumber, { color: textColor }]}>{dayNumber}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <LegendItem color={colors.primary} text="Active day" />
        <LegendItem color={colors.primaryLight} text="Some study" />
        <LegendItem color="#EEF0F4" text="No study" />
      </View>
    </View>
  );
}

function LegendItem({ color, text }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', aspectRatio: 1, padding: 3 },
  letter: {
    textAlign: 'center',
    fontSize: fontSize.small,
    fontWeight: '700',
    color: colors.muted,
  },
  circle: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: { backgroundColor: colors.primary },
  some: { backgroundColor: colors.primaryLight },
  none: { backgroundColor: '#EEF0F4' },
  today: { borderWidth: 2, borderColor: colors.accent },
  dayNumber: { fontSize: 13, fontWeight: '700' },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.sm },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 12, color: colors.muted },
});