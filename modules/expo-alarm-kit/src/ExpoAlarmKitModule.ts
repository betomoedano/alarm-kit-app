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
function schedule(): void {
  console.log("Schedule alarm called");
  // TODO: Implement actual alarm scheduling
}

/**
 * Schedule an alarm (placeholder implementation)
 */
async function scheduleOneOffAsync(): Promise<void> {
  return AlarmKitManager.scheduleOneOffAsync();
}

export const AlarmKit = {
  getAlarmPermissionsAsync,
  requestAlarmPermissionsAsync,
  schedule,
  scheduleOneOffAsync,
};

// Default export for easier imports
export default AlarmKit;
