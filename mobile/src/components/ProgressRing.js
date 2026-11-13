// A circular progress ring built from 60 small bars (no chart library needed).
// progress: 0 to 1. Whatever you put inside (children) shows in the middle.
// The ring turns green when it is full.
import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';

const SEGMENTS = 60;

export default function ProgressRing({
  progress = 0,
  size = 170,
  thickness = 14,
  color = colors.primary,
  trackColor = colors.border,
  children,
}) {
  const clamped = Math.min(1, Math.max(0, progress));

  // How many bars are "filled". Even a tiny bit of progress shows one bar.
  let filled = Math.round(clamped * SEGMENTS);
  if (clamped > 0 && filled === 0) filled = 1;

  const fillColor = clamped >= 1 ? colors.success : color;
  const barWidth = Math.max(3, ((Math.PI * size) / SEGMENTS) * 0.6);

  // Each bar sits at the top of its own full-size square.
  // Turning the square turns the bar around the centre of the ring.
  const bars = [];
  for (let i = 0; i < SEGMENTS; i += 1) {
    bars.push(
      <View
        key={i}
        style={[
          styles.layer,
          { width: size, height: size, transform: [{ rotate: `${(i * 360) / SEGMENTS}deg` }] },
        ]}
      >
        <View
          style={{
            alignSelf: 'center',
            width: barWidth,
            height: thickness,
            borderRadius: barWidth / 2,
            backgroundColor: i < filled ? fillColor : trackColor,
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {bars}
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});