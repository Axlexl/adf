import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "../constants/colors";
import { auth } from "../services/firebase";

export default function Index() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/home");
      } else {
        router.replace("/landing" as any);
      }
    });
    return unsub;
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator color={COLORS.text} size="large" />
    </View>
  );
}
