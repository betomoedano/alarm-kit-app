import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ExpoAlarmKit, { AlarmPermissionStatus } from "@/modules/expo-alarm-kit";
import { useEffect, useState } from "react";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [alarmPermissionStatus, setAlarmPermissionStatus] =
    useState<AlarmPermissionStatus>("notDetermined");

  useEffect(() => {
    getAlarmPermissionStatus();
  }, []);

  async function getAlarmPermissionStatus() {
    try {
      const status = await ExpoAlarmKit.getAlarmPermissionsAsync();
      setAlarmPermissionStatus(status);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (alarmPermissionStatus === "denied") {
    return (
      <View style={styles.container}>
        <Text>
          Permission denied, please go to settings and enable permissions.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>
        Alarm Permission Status:{" "}
        <Text style={{ fontWeight: "bold" }}>{alarmPermissionStatus}</Text>
      </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
