import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoAlarmKit.types';

type ExpoAlarmKitModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoAlarmKitModule extends NativeModule<ExpoAlarmKitModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoAlarmKitModule, 'ExpoAlarmKitModule');
