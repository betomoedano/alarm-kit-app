import { NativeModule } from "expo";

export type OnLoadEventPayload = {
  url: string;
};

export type ExpoAlarmKitModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export declare class ExpoAlarmKitModule extends NativeModule<ExpoAlarmKitModuleEvents> {
  PI: number;
  hello(): string;
  schedule(): Promise<void>;
  setValueAsync(value: string): Promise<void>;

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
  getAlarmPermissionsAsync(): Promise<boolean>;
}
