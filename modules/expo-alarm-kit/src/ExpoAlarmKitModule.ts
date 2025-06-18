import AlarmKitManager from "./AlarmKitManager";

/**
 * Request and check alarm permissions.
 *
 * @returns Promise that resolves to `true` if permissions are granted
 * @throws {PermissionsNotGranted} When alarm permissions are denied or not available
 * @throws {UnavailableException} When AlarmKit is not available (requires iOS 26+)
 *
 * @example
 * ```typescript
 * try {
 *   const hasPermissions = await getAlarmPermissionsAsync();
 *   console.log('Alarm permissions granted:', hasPermissions); // true
 * } catch (error) {
 *   if (error.code === 'PermissionsNotGranted') {
 *     console.log('User denied alarm permissions');
 *   } else if (error.code === 'UnavailableException') {
 *     console.log('AlarmKit requires iOS 26 or higher');
 *   }
 * }
 * ```
 */
async function getAlarmPermissionsAsync(): Promise<boolean> {
  return AlarmKitManager.getAlarmPermissionsAsync();
}

/**
 * Request alarm permissions.
 *
 * @returns Promise that resolves to `true` if permissions are granted
 * @throws {PermissionsNotGranted} When alarm permissions are denied or not available
 * @throws {UnavailableException} When AlarmKit is not available (requires iOS 26+)
 */
async function requestAlarmPermissionsAsync(): Promise<boolean> {
  return AlarmKitManager.requestAlarmPermissionsAsync();
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
