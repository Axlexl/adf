import { router } from "expo-router";
import {
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/colors";

const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=Vinzon+Street+Obrero,+ALT+BUILDING+Second+floor+Davao+City,+Davao+Del+Sur+8000";

export default function Address() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/home")}
        >
          <Text style={styles.backText}>B</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Address</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Address</Text>
        <TouchableOpacity
          style={styles.addressCard}
          onPress={() => Linking.openURL(mapUrl)}
        >
          <Text style={styles.addressText}>
            Vinzon Street Obrero, ALT BUILDING Second floor Davao City, Davao
            Del Sur 8000
          </Text>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapText}>Map preview</Text>
          </View>
          <Text style={styles.mapLink}>Tap to open in Google Maps</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  addressCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addressText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 180,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  mapText: {
    color: COLORS.subtext,
  },
  mapLink: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
