// The bottom tab bar with the 5 main screens.
// Each <Tabs.Screen name="..."> matches a file in this folder.
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';

// Builds the icon for a tab. The filled icon shows when the tab is selected.
function tabIcon(iconName) {
  return function TabIcon({ color, size, focused }) {
    return (
      <Ionicons
        name={focused ? iconName : `${iconName}-outline`}
        size={size}
        color={color}
      />
    );
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // each screen draws its own title
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks', tabBarIcon: tabIcon('checkbox') }} />
      <Tabs.Screen name="timer" options={{ title: 'Timer', tabBarIcon: tabIcon('timer') }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: tabIcon('stats-chart') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('person') }} />
    </Tabs>
  );
}