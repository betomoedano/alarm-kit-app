import { Button, Text, View } from "react-native";
import ExpoAlarmKit from "@/modules/expo-alarm-kit";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button title="Schedule Alarm" onPress={() => ExpoAlarmKit.schedule()} />
    </View>
  );
}
