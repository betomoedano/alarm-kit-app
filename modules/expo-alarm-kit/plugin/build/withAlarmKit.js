"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
const withAlarmKit = (config, options = {}) => {
    const message = options.NSAlarmKitUsageDescription ||
        "We'll schedule alerts for alarms you create within our app.";
    return (0, config_plugins_1.withInfoPlist)(config, (config) => {
        config.modResults.NSAlarmKitUsageDescription = message;
        return config;
    });
};
exports.default = withAlarmKit;
