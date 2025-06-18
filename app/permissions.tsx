import { View, Text, Button } from "react-native";
import ExpoAlarmKit from "@/modules/expo-alarm-kit";
import { useRouter } from "expo-router";

export default function Permissions() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 16, textAlign: "center", margin: 20 }}>
        To use alarms, we need permission to schedule and create notifications
        on your device. This allows us to wake you up at your chosen time.
      </Text>
      <Button
        title="Request Permissions"
        onPress={async () => {
          try {
            const status = await ExpoAlarmKit.requestAlarmPermissionsAsync();

            if (status === "authorized") {
              router.push("/");
            } else if (status === "denied") {
              alert(
                "Permission denied. Please go to settings and enable permissions."
              );
            } else {
              alert("Permission not determined. Please try again.");
            }
          } catch (error) {
            console.error(error);
          }
        }}
      />
    </View>
  );
}
