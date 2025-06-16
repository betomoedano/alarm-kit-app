import { NativeModule, requireNativeModule } from 'expo';

import { ExpoAlarmKitModuleEvents } from './ExpoAlarmKit.types';

declare class ExpoAlarmKitModule extends NativeModule<ExpoAlarmKitModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAlarmKitModule>('ExpoAlarmKit');
