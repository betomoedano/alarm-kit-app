import { Button, Text, View } from "react-native";
import ExpoAlarmKit from "@/modules/expo-alarm-kit";
import { useEffect, useState } from "react";

export default function Index() {
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    ExpoAlarmKit.getAlarmPermissionsAsync().then((hasPermissions) => {
      setHasPermissions(hasPermissions);
    });
  }, [hasPermissions]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Text>
        {hasPermissions ? "Permissions granted" : "Permissions denied"}
      </Text>
      <Button title="Schedule Alarm" onPress={() => ExpoAlarmKit.schedule()} />
    </View>
  );
}
