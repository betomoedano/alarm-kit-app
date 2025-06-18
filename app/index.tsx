import { Button, Text, View } from "react-native";
import ExpoAlarmKit, { AlarmPermissionStatus } from "@/modules/expo-alarm-kit";
import { useEffect, useState } from "react";

export default function Index() {
  const [alarmPermissionStatus, setAlarmPermissionStatus] =
    useState<AlarmPermissionStatus>("notDetermined");

  useEffect(() => {
    getPermissions();
  }, []);

  async function getPermissions() {
    try {
      const alarmPermissionStatus =
        await ExpoAlarmKit.getAlarmPermissionsAsync();
      console.log(">>> alarmPermissionStatus", alarmPermissionStatus);
      setAlarmPermissionStatus(alarmPermissionStatus);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Text>{alarmPermissionStatus}</Text>
      <Button
        title="Schedule One Off Alarm"
        onPress={() => {
          ExpoAlarmKit.scheduleOneOffAsync();
          alert("One off alarm scheduled");
        }}
      />
      <Button
        title="Schedule Alarm"
        onPress={() => {
          ExpoAlarmKit.schedule();
          alert("Alarm scheduled");
        }}
      />
    </View>
  );
}
