// ALL the ringing logic lives here. The timer screen only calls these functions.
//   requestAlarmPermission()  ask the user for permission (and create the Android channel)
//   hasAlarmPermission()      is permission already granted?
//   scheduleTimerEnd(...)     ask the phone to ring at an exact time, even in the background
//   cancelTimerEnd(id)        cancel a scheduled ring (pause / finish early)
//   vibrateAlarm()            vibrate now (used when the app is open and time is up)
//   stopVibration()
//   getLastAlarmError()       the problems found since the last permission request, or ''
//   getChannelInfo()          which Android channel setup worked (for diagnosing)
import { Platform, Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

// Android only lets you change a channel's sound/importance when it is first created.
// If we ever change those settings, use a NEW id here (for example 'timer-alarm-v2').
export const ALARM_CHANNEL_ID = 'timer-alarm';

// ----- problems we remember, so a screen can show them while we test -----
let errors = [];
function remember(context, err) {
  const text = `${context}: ${err && err.message ? err.message : String(err)}`;
  errors.push(text);
  console.warn(text);
}
export function getLastAlarmError() {
  return errors.join(' | ');
}

// The channel we managed to create (Android), or null if creating it failed
let channelId = null;
let channelInfo = 'not created yet';
export function getChannelInfo() {
  return channelInfo;
}

// Show the notification (banner + sound) even while TaskGo is open on screen,
// so the alarm also rings when you are looking at the timer.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// The phone answered "granted" (either field can say it, depending on the version)
function isGranted(permission) {
  return permission.granted === true || permission.status === 'granted';
}

// Android: create the "Timer alarm" channel. Some phones reject some settings, so we
// try the fullest setup first and fall back to simpler ones. If all fail, we carry on
// without a custom channel and the phone's default channel is used.
// Does nothing on iPhone.
async function ensureAlarmChannel() {
  if (Platform.OS !== 'android') return;
  if (channelId) return; // already created during this app session

  const attempts = [
    {
      label: 'full',
      settings: {
        name: 'Timer alarm',
        description: 'Rings when your study timer ends',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        enableVibrate: true,
        vibrationPattern: [0, 500, 250, 500, 250, 500],
      },
    },
    {
      label: 'simple',
      settings: {
        name: 'Timer alarm',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500, 250, 500],
      },
    },
    {
      label: 'minimal',
      settings: {
        name: 'Timer alarm',
        importance: Notifications.AndroidImportance.MAX,
      },
    },
  ];

  for (const attempt of attempts) {
    try {
      await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, attempt.settings);
      channelId = ALARM_CHANNEL_ID;
      channelInfo = `created (${attempt.label} setup)`;
      return;
    } catch (err) {
      remember(`Alarm channel '${attempt.label}' failed`, err);
    }
  }
  channelInfo = 'FAILED, using the phone default channel';
}

// Is notification permission already granted?
export async function hasAlarmPermission() {
  try {
    return isGranted(await Notifications.getPermissionsAsync());
  } catch (err) {
    remember('Could not check notification permission', err);
    return false;
  }
}

// Asks for permission if needed. Returns true when the alarm is allowed to ring.
export async function requestAlarmPermission() {
  errors = [];
  try {
    await ensureAlarmChannel(); // Android prefers a channel before it asks
    const current = await Notifications.getPermissionsAsync();
    if (isGranted(current)) return true;
    if (current.canAskAgain === false) return false; // the user said "don't ask again"
    const asked = await Notifications.requestPermissionsAsync();
    return isGranted(asked);
  } catch (err) {
    remember('Could not ask for notification permission', err);
    return false;
  }
}

// Schedules the ring for an exact moment.
//   endTimeMs: when to ring, as a Date.now() style number
//   label:     short text for the message, like the subject
// Returns the notification id (keep it, you need it to cancel), or null on failure.
export async function scheduleTimerEnd(endTimeMs, label = 'study') {
  if (endTimeMs <= Date.now() + 500) return null; // already over, nothing to schedule
  try {
    await ensureAlarmChannel();
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time's up!",
        body: `Your ${label} session is finished. Great focus!`,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(endTimeMs),
        // only point at our channel if it really exists
        ...(channelId ? { channelId } : {}),
      },
    });
  } catch (err) {
    remember('Could not schedule the timer alarm', err);
    return null;
  }
}

// Cancels a ring that was scheduled with scheduleTimerEnd
export async function cancelTimerEnd(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    remember('Could not cancel the timer alarm', err);
  }
}

// Vibrate: three buzzes (iPhone does one short buzz) plus a "success" tap
export function vibrateAlarm() {
  Vibration.vibrate([0, 600, 300, 600, 300, 600]);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function stopVibration() {
  Vibration.cancel();
}