import { ConfigPlugin, withInfoPlist } from "expo/config-plugins";

type Options = {
  NSAlarmKitUsageDescription?: string;
};

const withAlarmKit: ConfigPlugin<Options> = (config, options = {}) => {
  const message =
    options.NSAlarmKitUsageDescription ||
    "We'll schedule alerts for alarms you create within our app.";

  return withInfoPlist(config, (config) => {
    config.modResults.NSAlarmKitUsageDescription = message;
    return config;
  });
};

export default withAlarmKit;
