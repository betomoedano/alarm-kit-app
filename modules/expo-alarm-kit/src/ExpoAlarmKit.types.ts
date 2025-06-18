import { NativeModule } from "expo";

export type ExpoAlarmKitModuleEvents = {
  onChange: (params: string) => void;
};

export declare class ExpoAlarmKitModule extends NativeModule<ExpoAlarmKitModuleEvents> {
  getAlarmPermissionsAsync(): Promise<boolean>;
  requestAlarmPermissionsAsync(): Promise<boolean>;
  schedule(): void;
}
