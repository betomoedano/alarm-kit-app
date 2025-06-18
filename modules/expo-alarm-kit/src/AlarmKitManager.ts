import { requireNativeModule } from "expo";
import { ExpoAlarmKitModule } from "./ExpoAlarmKit.types";

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAlarmKitModule>("ExpoAlarmKit");
