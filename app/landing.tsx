import { router } from "expo-router";
import { useState } from "react";
import {
    Image as RNImage,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import PageLoader from "../components/ui/PageLoader";
import { COLORS } from "../constants/colors";

// Using URI fallback — replace with require("../assets/images/adf2.png") once file is added
const logoSource = { uri: "https://img.freepik.com/premium-vector/adf-creative-abstract-alphabet-modern-minimal-letter-initial-business-symbol-icon-vector-logo_1237311-3286.jpg" };

export default function Landing() {
  const [loading, setLoading] = useState(false);

  function handleGetStarted() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("/auth" as any);
    }, 1200);
  }

  if (loading) return <PageLoader />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>

        {/* Gold top accent line */}
        <View style={styles.topAccent} />

        {/* Brand */}
        <Text style={styles.tagline}>PREMIUM BARBERSHOP</Text>
        <Text style={styles.title}>ALLDAYFADE</Text>
        <Text style={styles.subtitle}>BOOKING APP</Text>

        {/* Logo */}
        <View style={styles.logoWrapper}>
          <RNImage source={logoSource} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Gold divider */}
        <View style={styles.divider} />

        {/* Description */}
        <Text style={styles.description}>
          AllDayFade is a barber booking app that lets customers quickly set
          appointments for high-rated hair services so clients won't have to
          wait. Its goal is to make booking easy and convenient.
        </Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={handleGetStarted}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Get Started</Text>
        </TouchableOpacity>

        {/* Bottom quote */}
        <Text style={styles.quote}>"Your style. Your identity."</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 32,
    padding: 36,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  topAccent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
  },
  tagline: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: 8,
    marginTop: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.subtext,
    letterSpacing: 5,
    marginBottom: 32,
  },
  logoWrapper: {
    width: 150,
    height: 150,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 28,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: 24,
  },
  description: {
    fontSize: 13,
    color: COLORS.subtext,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  btnText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 2,
  },
  quote: {
    color: COLORS.subtext,
    fontSize: 13,
    fontStyle: "italic",
    letterSpacing: 1,
  },
});
