import { ExpoConfig } from "expo/config";

module.exports = ({ config }: { config: ExpoConfig }) => {
  return {
    name: "alarm-kit-app",
    slug: "alarm-kit-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "alarmkitapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.betoatexpo.alarm-kit-app",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      ["./modules/expo-alarm-kit/plugin/build/withAlarmKit", {}],
    ],
    experiments: {
      typedRoutes: true,
    },
  };
};
