// Reexport the native module. On web, it will be resolved to ExpoAlarmKitModule.web.ts
// and on native platforms to ExpoAlarmKitModule.ts
export { default } from "./src/ExpoAlarmKitModule";
export * from "./src/ExpoAlarmKit.types";
