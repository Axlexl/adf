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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/home")}
        >
          <Text style={styles.backText}>B</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>About</Text>
        <Text style={styles.text}>local barbershop in Davao City!</Text>
        <Text style={styles.text}>
          ALLDAYFADE 3 branches ALT building Vinzon Street Obrero Davao City
        </Text>
        <Text style={styles.text}>
          Sta ana ave infront of aisat building Davao City
        </Text>
        <Text style={styles.text}>Medalla Buhangin Davao City</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact us</Text>
          <TouchableOpacity
            onPress={() => openLink("mailto:alldayfade@gmail.com")}
          >
            <Text style={styles.link}>alldayfade@gmail.com</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openLink("https://tiktok.com/alldayfade")}
          >
            <Text style={styles.link}>https://tiktok.com/alldayfade</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Good to know</Text>
          <TouchableOpacity onPress={() => setPolicyVisible(true)}>
            <Text style={styles.link}>Booking policy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social media</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink("https://www.instagram.com/alldayfade")}
            >
              <Text style={styles.socialIcon}>📸</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink("https://www.facebook.com/alldayfade")}
            >
              <Text style={styles.socialIcon}>f</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={policyVisible}
        onRequestClose={() => setPolicyVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Our Booking Policy</Text>
            <Text style={styles.modalText}>
              Please choose your service accordingly to our cut especially to
              "Long to Short" and etc. Be at exact time of your bookings.
            </Text>
            <View style={styles.modalBox}>
              <Text style={styles.modalBoxText}>
                Cancellation policy You can cancel or reschedule up to 6 hours
                before the appointment time.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setPolicyVisible(false)}
            >
              <Text style={styles.modalButtonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  text: {
    color: COLORS.subtext,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 10,
  },
  link: {
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 8,
    textDecorationLine: "underline",
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  socialIcon: {
    fontSize: 22,
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  modalText: {
    color: COLORS.subtext,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  modalBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  modalBoxText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  modalButton: {
    borderWidth: 1,
    borderColor: COLORS.text,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  modalButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
