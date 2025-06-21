import { NativeModule } from "expo";

export type ExpoAlarmKitModuleEvents = {
  onChange: (params: string) => void;
};

export type AlarmPermissionStatus =
  | "authorized"
  | "denied"
  | "notDetermined"
  | "unknown";

export type AlarmState = "alerting" | "scheduled" | "paused" | "countdown";

export type Alarm = {
  id: string;
  state: AlarmState;
  fireDate?: number;  // Optional since some alarms may not have fixed dates
};

export declare class ExpoAlarmKitModule extends NativeModule<ExpoAlarmKitModuleEvents> {
  getAlarmPermissionsAsync(): Promise<AlarmPermissionStatus>;
  requestAlarmPermissionsAsync(): Promise<boolean>;
  getAllScheduledAlarmsAsync(): Promise<Alarm[]>;
  scheduleOneOffAsync(): Promise<void>;
}
