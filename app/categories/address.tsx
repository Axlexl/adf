import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import PageLoader from "../../components/ui/PageLoader";
import { COLORS } from "../../constants/colors";
import { usePageLoader } from "../../hooks/usePageLoader";

const GOLD = COLORS.primary;

const mapUrl =
  "https://www.google.com/maps/search/?api=1&query=Vinzon+Street+Obrero,+ALT+BUILDING+Second+floor+Davao+City,+Davao+Del+Sur+8000";

const details = [
  { icon: "location-outline", label: "Address", value: "Vinzon Street Obrero, ALT BUILDING\nSecond floor, Davao City\nDavao Del Sur 8000" },
  { icon: "time-outline", label: "Hours", value: "Monday – Saturday\n9:00 AM – 8:00 PM" },
  { icon: "call-outline", label: "Contact", value: "+63 994 909 5075" },
  { icon: "mail-outline", label: "Email", value: "alldayfade@gmail.com" },
];

export default function Address() {
  const pageReady = usePageLoader(500);

  if (!pageReady) return <PageLoader />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/home")}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Find Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero label */}
        <Text style={styles.heroTag}>OUR LOCATION</Text>
        <Text style={styles.heroTitle}>Visit the{"\n"}Shop</Text>

        {/* Gold divider */}
        <View style={styles.divider} />

        {/* Detail cards */}
        {details.map((item) => (
          <View key={item.label} style={styles.detailCard}>
            <View style={styles.iconBox}>
              <Ionicons name={item.icon as any} size={22} color={GOLD} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          </View>
        ))}

        {/* Map placeholder */}
        <View style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={48} color={GOLD} />
            <Text style={styles.mapPlaceholderText}>Davao City, Philippines</Text>
          </View>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => Linking.openURL(mapUrl)}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate-outline" size={16} color={COLORS.background} />
            <Text style={styles.mapBtnText}>Open in Google Maps</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16,
  },
  backButton: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.card, justifyContent: "center", alignItems: "center",
  },
  pageTitle: { color: COLORS.text, fontSize: 18, fontWeight: "bold" },
  placeholder: { width: 48 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },

  heroTag: {
    color: GOLD, fontSize: 11, fontWeight: "700",
    letterSpacing: 4, marginBottom: 8,
  },
  heroTitle: {
    color: COLORS.text, fontSize: 36, fontWeight: "900",
    lineHeight: 42, marginBottom: 20,
  },
  divider: {
    width: 50, height: 2, backgroundColor: GOLD,
    borderRadius: 2, marginBottom: 28,
  },

  detailCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 16,
    backgroundColor: COLORS.card, borderRadius: 16, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: COLORS.border,
  },
  detailLabel: {
    color: GOLD, fontSize: 11, fontWeight: "700",
    letterSpacing: 2, marginBottom: 4,
  },
  detailValue: {
    color: COLORS.text, fontSize: 14, lineHeight: 22,
  },

  mapCard: {
    backgroundColor: COLORS.card, borderRadius: 20,
    overflow: "hidden", marginTop: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  mapPlaceholder: {
    height: 180, justifyContent: "center", alignItems: "center",
    backgroundColor: "#111", gap: 12,
  },
  mapPlaceholderText: {
    color: COLORS.subtext, fontSize: 13, letterSpacing: 1,
  },
  mapBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: GOLD, paddingVertical: 16,
  },
  mapBtnText: {
    color: COLORS.background, fontSize: 14, fontWeight: "800", letterSpacing: 1,
  },
});
