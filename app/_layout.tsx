import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import ExpoAlarmKit, { AlarmPermissionStatus } from "@/modules/expo-alarm-kit";

export default function RootLayout() {
  const [alarmPermissionStatus, setAlarmPermissionStatus] =
    useState<AlarmPermissionStatus>("notDetermined");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ExpoAlarmKit.getAlarmPermissionsAsync().then((status) => {
      console.log(">>> status", status);
      setAlarmPermissionStatus(status);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <></>;
  }

  return (
    <Stack>
      <Stack.Protected guard={alarmPermissionStatus === "authorized"}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen name="permissions" options={{ headerShown: false }} />
    </Stack>
  );
}
