// A simple bar chart made of plain views (no chart library).
// data: [{ label: 'Mon', value: 35, highlight: true }, ...]
// value is the bar height number (minutes). highlight colors the bar orange.
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize } from '../constants/theme';

export default function BarChart({ data, height = 150 }) {
  // The tallest bar fills the chart. At least 1 so we never divide by zero.
  const maxValue = Math.max(1, ...data.map((item) => item.value));

  return (
    <View style={styles.chart}>
      {data.map((item, index) => {
        const hasValue = item.value > 0;
        const barHeight = hasValue ? Math.max(6, (item.value / maxValue) * height) : 4;
        const barColor = !hasValue ? colors.border : item.highlight ? colors.accent : colors.primary;

        return (
          <View key={`${item.label}-${index}`} style={styles.column}>
            <Text style={styles.value}>{hasValue ? item.value : ''}</Text>
            <View style={{ height, justifyContent: 'flex-end', alignSelf: 'stretch' }}>
              <View
                style={{
                  height: barHeight,
                  backgroundColor: barColor,
                  borderRadius: 6,
                  width: '70%',
                  alignSelf: 'center',
                }}
              />
            </View>
            <Text style={[styles.label, item.highlight && styles.labelHighlight]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { flexDirection: 'row', alignItems: 'flex-end' },
  column: { flex: 1, alignItems: 'center' },
  value: {
    height: 18,
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  label: {
    marginTop: 6,
    fontSize: fontSize.small,
    color: colors.muted,
    fontWeight: '600',
  },
  labelHighlight: { color: colors.accent },
});