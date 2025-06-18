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

export const AlarmKit = {
  getAlarmPermissionsAsync,
  requestAlarmPermissionsAsync,
  schedule,
};

// Default export for easier imports
export default AlarmKit;
