import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/colors";
import { auth, db } from "../../services/firebase";

export default function Details() {
  const { service, price, duration, barber, date, time } =
    useLocalSearchParams<{
      service: string; price: string; duration: string;
      barber: string; date: string; time: string;
    }>();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(auth.currentUser?.email ?? "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({});

  // Pre-fill from saved user profile
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getDoc(doc(db, "users", uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.fullName) setFullName(d.fullName);
        if (d.phone) setPhone(d.phone);
        if (d.address) setAddress(d.address);
        if (d.city) setCity(d.city);
        if (d.province) setProvince(d.province);
        if (d.postalCode) setPostalCode(d.postalCode);
      }
    });
  }, []);

  async function handleConfirm() {
    const newErrors: { fullName?: string; phone?: string; email?: string } = {};
    if (!fullName.trim()) newErrors.fullName = "Required";
    if (!phone.trim()) newErrors.phone = "Required";
    if (!email.trim()) newErrors.email = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const bookingId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const uid = auth.currentUser?.uid ?? null;
    const now = new Date().toISOString();

    // Save booking
    addDoc(collection(db, "bookings"), {
      bookingId, service, price, duration, barber, date, time,
      fullName, phone, email, address, city, province, postalCode, comments,
      uid, status: "confirmed", isoDate: now, createdAt: now,
    }).catch((err) => console.warn("Firestore bookings failed:", err));

    // Save/update user profile
    if (uid) {
      setDoc(doc(db, "users", uid), {
        fullName, phone, email, address, city, province, postalCode,
        uid, updatedAt: now,
      }, { merge: true }).catch((err) => console.warn("Firestore users failed:", err));
    }

    // Save transaction
    addDoc(collection(db, "transactions"), {
      bookingId, uid, service, price, barber, date, time,
      fullName, status: "confirmed", createdAt: now,
    }).catch((err) => console.warn("Firestore transactions failed:", err));

    router.replace({
      pathname: "/categories/confirmed" as any,
      params: { service, duration, barber, date, time, bookingId },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Your details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            placeholder="Full Name"
            placeholderTextColor={COLORS.subtext}
            value={fullName}
            onChangeText={(v) => { setFullName(v); setErrors((e) => ({ ...e, fullName: undefined })); }}
          />
          {errors.fullName && <Text style={styles.errorText}>Required</Text>}

          <Text style={styles.label}>Phone <Text style={styles.required}>*</Text></Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+63</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput, errors.phone && styles.inputError]}
              placeholder="Phone number"
              placeholderTextColor={COLORS.subtext}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: undefined })); }}
            />
          </View>
          {errors.phone && <Text style={styles.errorText}>Required</Text>}

          <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="email@example.com"
            placeholderTextColor={COLORS.subtext}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
          />
          {errors.email && <Text style={styles.errorText}>Required</Text>}

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Street address"
            placeholderTextColor={COLORS.subtext}
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor={COLORS.subtext}
            value={city}
            onChangeText={setCity}
          />

          <Text style={styles.label}>Province</Text>
          <TextInput
            style={styles.input}
            placeholder="Province"
            placeholderTextColor={COLORS.subtext}
            value={province}
            onChangeText={setProvince}
          />

          <Text style={styles.label}>Postal code</Text>
          <TextInput
            style={styles.input}
            placeholder="Postal code"
            placeholderTextColor={COLORS.subtext}
            keyboardType="numeric"
            value={postalCode}
            onChangeText={setPostalCode}
          />

          <Text style={styles.label}>Comments</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional notes..."
            placeholderTextColor={COLORS.subtext}
            multiline
            numberOfLines={4}
            value={comments}
            onChangeText={setComments}
          />

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading
              ? <ActivityIndicator color={COLORS.background} />
              : <Text style={styles.confirmBtnText}>Confirm</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.policyCard}>
          <Text style={styles.policyHeading}>Booking policy:</Text>
          <Text style={styles.policyText}>
            Please choose your service accordingly to our cut especially to "Long to Short" and etc. Be at exact time of your bookings.
          </Text>
          <Text style={[styles.policyHeading, { marginTop: 12 }]}>Cancellation policy:</Text>
          <Text style={styles.policyText}>
            You can cancel or reschedule up to 6 hours before the appointment time.
          </Text>
          <Text style={[styles.policyHeading, { marginTop: 12 }]}>Additional information:</Text>
          <Text style={styles.policyText}>
            When booking with AllDayFade, you may receive appointment-specific communication. This includes confirmations, receipts and reminders via email and SMS.
          </Text>
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
  backButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.card, justifyContent: "center", alignItems: "center" },
  pageTitle: { color: COLORS.text, fontSize: 18, fontWeight: "bold" },
  placeholder: { width: 48 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 18, marginBottom: 16 },
  label: { color: COLORS.text, fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 14 },
  required: { color: COLORS.primary },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.text, fontSize: 14,
  },
  inputError: { borderColor: COLORS.primary },
  errorText: { color: COLORS.primary, fontSize: 12, marginTop: 4 },
  phoneRow: { flexDirection: "row", gap: 8 },
  countryCode: {
    backgroundColor: COLORS.background,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 12, justifyContent: "center",
  },
  countryCodeText: { color: COLORS.text, fontSize: 14 },
  phoneInput: { flex: 1 },
  textArea: { height: 100, textAlignVertical: "top" },
  confirmBtn: {
    backgroundColor: COLORS.text, marginTop: 20,
    paddingVertical: 14, borderRadius: 30, alignItems: "center",
  },
  confirmBtnText: { color: COLORS.background, fontSize: 15, fontWeight: "700" },
  policyCard: { backgroundColor: COLORS.card, borderRadius: 20, padding: 18 },
  policyHeading: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  policyText: { color: COLORS.subtext, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
