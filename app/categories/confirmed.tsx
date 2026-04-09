import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Clipboard,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/colors";

const SHOP_ADDRESS = "Vinzon Street Obrero, ALT BUILDING Second floor Davao City, Davao Del Sur 8000";

export default function Confirmed() {
  const { service, duration, barber, date, time, bookingId, emailReminder } =
    useLocalSearchParams<{
      service: string; duration: string; barber: string;
      date: string; time: string; bookingId: string; emailReminder: string;
    }>();

  const [copied, setCopied] = useState(false);

  function copyBookingId() {
    Clipboard.setString(bookingId ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo badge */}
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>ALLDAYFADE</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Booking confirmed</Text>
          <Text style={styles.subtitle}>with AllDayFade</Text>

          {/* Date & time */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Date & time</Text>
            <View style={styles.rowValue}>
              <Text style={styles.rowValueBold}>{date} · {time}</Text>
              <Text style={styles.rowValueSub}>Time zone (Asia/Manila)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Address */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Address</Text>
            <Text style={[styles.rowValueBold, styles.addressText]}>{SHOP_ADDRESS}</Text>
          </View>

          <View style={styles.divider} />

          {/* Booking ID */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Booking ID</Text>
            <TouchableOpacity style={styles.bookingIdRow} onPress={copyBookingId}>
              <Text style={styles.rowValueBold}>{bookingId}</Text>
              <Text style={styles.copyIcon}>{copied ? "✓" : "⧉"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Service */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Service</Text>
            <View style={styles.serviceRow}>
              <View style={styles.serviceIcon}>
                <Text style={styles.serviceIconText}>ADF</Text>
              </View>
              <View>
                <Text style={styles.rowValueBold}>{service}</Text>
                <Text style={styles.rowValueSub}>{duration} · with {barber}</Text>
              </View>
            </View>
          </View>

          {emailReminder === "1" && (
            <Text style={styles.emailNotice}>A confirmation has been emailed to you</Text>
          )}

          <TouchableOpacity
            style={styles.bookAnotherBtn}
            onPress={() => router.replace("/home")}
            activeOpacity={0.85}
          >
            <Text style={styles.bookAnotherText}>Book another appointment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  logoBadge: {
    marginTop: 32,
    marginBottom: -20,
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#111",
    borderWidth: 2, borderColor: COLORS.border,
    justifyContent: "center", alignItems: "center",
    zIndex: 1,
  },
  logoText: { color: COLORS.text, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  title: {
    color: COLORS.text, fontSize: 26, fontWeight: "800",
    textAlign: "center", marginBottom: 6,
  },
  subtitle: {
    color: COLORS.subtext, fontSize: 14,
    textAlign: "center", marginBottom: 28,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 14,
    gap: 16,
  },
  rowLabel: {
    color: COLORS.subtext, fontSize: 13,
    width: 80, flexShrink: 0,
  },
  rowValue: { flex: 1 },
  rowValueBold: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  rowValueSub: { color: COLORS.subtext, fontSize: 12, marginTop: 3 },
  addressText: { flex: 1, lineHeight: 20 },
  bookingIdRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  copyIcon: { color: COLORS.subtext, fontSize: 16 },
  serviceRow: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  serviceIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: "#222",
    justifyContent: "center", alignItems: "center",
  },
  serviceIconText: { color: COLORS.text, fontSize: 9, fontWeight: "900" },
  divider: { height: 1, backgroundColor: COLORS.border },
  emailNotice: {
    color: COLORS.subtext, fontSize: 13,
    textAlign: "center", marginTop: 24, marginBottom: 8,
  },
  bookAnotherBtn: {
    marginTop: 16,
    borderWidth: 1, borderColor: COLORS.text,
    borderRadius: 30, paddingVertical: 14,
    alignItems: "center",
  },
  bookAnotherText: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
});
