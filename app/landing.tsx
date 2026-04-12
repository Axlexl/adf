import { router } from "expo-router";
import {
  Image as RNImage,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Drop your logo at: assets/images/adf2.png ──
const adf2 = require("../assets/images/adf2.png");

export default function Landing() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>ALLDAYFADE</Text>
        <Text style={styles.subtitle}>BOOKING APP</Text>

        {/* ADF Logo — place your image at assets/images/adf2.png */}
        <View style={styles.logoWrapper}>
          <RNImage source={adf2} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.description}>
          AllDayFade is a barber booking app that lets customers quickly set
          appointments for high-rated hair services so clients won't have to
          wait. Its goal is to make booking easy and convenient.
        </Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push("/auth" as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 32,
    padding: 36,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#a1a1a1",
    letterSpacing: 4,
    marginBottom: 36,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 36,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  description: {
    fontSize: 14,
    color: "#a1a1a1",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 4,
  },
  btn: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  btnText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
