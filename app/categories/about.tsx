import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Linking,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/colors";

export default function About() {
  const [policyVisible, setPolicyVisible] = useState(false);

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn("Unable to open URL:", url, error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/home")}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heroTag}>OUR STORY</Text>
        <Text style={styles.heroTitle}>About{"\n"}AllDayFade</Text>
        <View style={styles.goldLine} />

        {/* About card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>WHO WE ARE</Text>
          <Text style={styles.cardText}>
            AllDayFade is a premium local barbershop in Davao City, dedicated to delivering sharp cuts, clean fades, and top-tier grooming services.
          </Text>
        </View>

        {/* Branches */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>OUR BRANCHES</Text>
          {[
            "ALT Building, Vinzon Street Obrero, Davao City",
            "Sta. Ana Ave., in front of AISAT Building, Davao City",
            "Medalla, Buhangin, Davao City",
          ].map((branch, i) => (
            <View key={i} style={styles.branchRow}>
              <Ionicons name="location" size={14} color={COLORS.primary} />
              <Text style={styles.branchText}>{branch}</Text>
            </View>
          ))}
        </View>

        {/* Contact */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>CONTACT US</Text>
          <TouchableOpacity style={styles.contactRow} onPress={() => openLink("mailto:alldayfade@gmail.com")}>
            <Ionicons name="mail-outline" size={16} color={COLORS.primary} />
            <Text style={styles.contactText}>alldayfade@gmail.com</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactRow} onPress={() => openLink("https://tiktok.com/alldayfade")}>
            <Ionicons name="logo-tiktok" size={16} color={COLORS.primary} />
            <Text style={styles.contactText}>tiktok.com/alldayfade</Text>
          </TouchableOpacity>
        </View>

        {/* Social */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>FOLLOW US</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink("https://www.instagram.com/alldayfade")}>
              <Ionicons name="logo-instagram" size={22} color={COLORS.primary} />
              <Text style={styles.socialLabel}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink("https://www.facebook.com/alldayfade")}>
              <Ionicons name="logo-facebook" size={22} color={COLORS.primary} />
              <Text style={styles.socialLabel}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Policy */}
        <TouchableOpacity style={styles.policyBtn} onPress={() => setPolicyVisible(true)}>
          <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
          <Text style={styles.policyBtnText}>View Booking Policy</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.subtext} />
        </TouchableOpacity>
      </ScrollView>

      <Modal animationType="fade" transparent visible={policyVisible} onRequestClose={() => setPolicyVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTopAccent} />
            <Text style={styles.modalTitle}>Booking Policy</Text>
            <Text style={styles.modalText}>
              Please choose your service accordingly to our cut especially "Long to Short" etc. Be at exact time of your bookings.
            </Text>
            <View style={styles.modalBox}>
              <Text style={styles.modalBoxLabel}>CANCELLATION</Text>
              <Text style={styles.modalBoxText}>
                You can cancel or reschedule up to 6 hours before the appointment time.
              </Text>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={() => setPolicyVisible(false)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16,
  },
  backButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.card, justifyContent: "center", alignItems: "center" },
  pageTitle: { color: COLORS.text, fontSize: 18, fontWeight: "bold" },
  placeholder: { width: 48 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  heroTag: { color: COLORS.primary, fontSize: 11, fontWeight: "700", letterSpacing: 4, marginBottom: 8 },
  heroTitle: { color: COLORS.text, fontSize: 34, fontWeight: "900", lineHeight: 40, marginBottom: 16 },
  goldLine: { width: 50, height: 2, backgroundColor: COLORS.primary, borderRadius: 2, marginBottom: 24 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardLabel: { color: COLORS.primary, fontSize: 10, fontWeight: "700", letterSpacing: 3, marginBottom: 12 },
  cardText: { color: COLORS.subtext, fontSize: 14, lineHeight: 22 },
  branchRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 10 },
  branchText: { color: COLORS.text, fontSize: 13, lineHeight: 20, flex: 1 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  contactText: { color: COLORS.text, fontSize: 14, textDecorationLine: "underline" },
  socialRow: { flexDirection: "row", gap: 12 },
  socialBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: COLORS.background, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  socialLabel: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  policyBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: COLORS.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 8,
  },
  policyBtnText: { color: COLORS.text, fontSize: 14, fontWeight: "600", flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalContent: { width: "100%", backgroundColor: COLORS.card, borderRadius: 24, overflow: "hidden" },
  modalTopAccent: { height: 3, backgroundColor: COLORS.primary },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700", margin: 24, marginBottom: 12 },
  modalText: { color: COLORS.subtext, fontSize: 14, lineHeight: 22, marginHorizontal: 24, marginBottom: 16 },
  modalBox: { backgroundColor: "#1a1500", borderRadius: 12, padding: 16, marginHorizontal: 24, marginBottom: 24, borderWidth: 1, borderColor: COLORS.primary },
  modalBoxLabel: { color: COLORS.primary, fontSize: 10, fontWeight: "700", letterSpacing: 2, marginBottom: 8 },
  modalBoxText: { color: COLORS.text, fontSize: 13, lineHeight: 20 },
  modalButton: { backgroundColor: COLORS.primary, paddingVertical: 16, alignItems: "center", margin: 24, marginTop: 0, borderRadius: 14 },
  modalButtonText: { color: COLORS.background, fontSize: 15, fontWeight: "800", letterSpacing: 1 },
});
