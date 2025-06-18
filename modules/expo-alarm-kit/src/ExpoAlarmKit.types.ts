import { NativeModule } from "expo";

export type ExpoAlarmKitModuleEvents = {
  onChange: (params: string) => void;
};

export type AlarmPermissionStatus =
  | "authorized"
  | "denied"
  | "notDetermined"
  | "unknown";

export declare class ExpoAlarmKitModule extends NativeModule<ExpoAlarmKitModuleEvents> {
  getAlarmPermissionsAsync(): Promise<AlarmPermissionStatus>;
  requestAlarmPermissionsAsync(): Promise<boolean>;
  getAllScheduledAlarmsAsync(): Promise<any[]>;
  scheduleOneOffAsync(): Promise<void>;
}
