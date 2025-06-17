import { ConfigPlugin } from "expo/config-plugins";
type Options = {
    NSAlarmKitUsageDescription?: string;
};
declare const withAlarmKit: ConfigPlugin<Options>;
export default withAlarmKit;
