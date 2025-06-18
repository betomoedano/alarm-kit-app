import AlarmKitManager from "./AlarmKitManager";
import { AlarmPermissionStatus } from "./ExpoAlarmKit.types";

/**
 * Gets and requests alarm permission if needed.
 *
 * @returns Promise that resolves to `AlarmPermissionStatus`
 *
 */
async function getAlarmPermissionsAsync(): Promise<AlarmPermissionStatus> {
  return AlarmKitManager.getAlarmPermissionsAsync();
}

/**
 * Gets and requests alarm permission if needed.
 *
 * @returns Promise that resolves to `AlarmPermissionStatus`
 *
 */
async function requestAlarmPermissionsAsync(): Promise<AlarmPermissionStatus> {
  return AlarmKitManager.getAlarmPermissionsAsync();
}

/**
 * Schedule an alarm (placeholder implementation)
 */
async function scheduleOneOffAsync(): Promise<void> {
  return AlarmKitManager.scheduleOneOffAsync();
}

/**
 * Get all scheduled alarms.
 */
async function getAllScheduledAlarmsAsync(): Promise<any[]> {
  return AlarmKitManager.getAllScheduledAlarmsAsync();
}

export const AlarmKit = {
  getAlarmPermissionsAsync,
  requestAlarmPermissionsAsync,
  scheduleOneOffAsync,
  getAllScheduledAlarmsAsync,
};

// Default export for easier imports
export default AlarmKit;
