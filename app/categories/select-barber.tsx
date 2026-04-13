import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS } from "../../constants/colors";
import { db } from "../../services/firebase";

type Barber = { id: string; name: string; role: string };
type Schedule = { barberId: string; date: string; takenSlots: string[]; availableSlots: string[] };

export default function SelectBarber() {
  const { service, price, duration } = useLocalSearchParams<{
    service: string; price: string; duration: string;
  }>();

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const unsubBarbers = onSnapshot(query(collection(db, "team")), (snap) => {
      setBarbers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Barber, "id">) })));
    });
    const unsubSchedules = onSnapshot(query(collection(db, "barber_schedules")), (snap) => {
      setSchedules(snap.docs.map((d) => d.data() as Schedule));
    });
    return () => { unsubBarbers(); unsubSchedules(); };
  }, []);

  function getScheduleForBarber(barberName: string) {
    return schedules.find((s) => s.barberId === barberName && s.date === today);
  }

  function handleBook() {
    if (selectedIndex === null) return;
    const barber = barbers[selectedIndex];
    router.push({
      pathname: "/categories/booking",
      params: { service, price, duration, barber: barber.name },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Select Barber</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heroTag}>CHOOSE YOUR ARTIST</Text>
        <Text style={styles.heroTitle}>Our{"\n"}Barbers</Text>
        <View style={styles.goldLine} />

        {barbers.map((barber, index) => {
          const selected = selectedIndex === index;
          const schedule = getScheduleForBarber(barber.name);
          const takenCount = schedule?.takenSlots?.length ?? 0;
          const availableCount = schedule?.availableSlots?.length ?? 0;
          return (
            <TouchableOpacity
              key={barber.id}
              style={[styles.barberCard, selected && styles.barberCardSelected]}
              activeOpacity={0.88}
              onPress={() => setSelectedIndex(index)}
            >
              {selected && <View style={styles.selectedAccent} />}
              <View style={[styles.barberAvatar, selected && styles.barberAvatarSelected]}>
                <Text style={styles.avatarText}>{barber.name.charAt(0)}</Text>
              </View>
              <View style={styles.barberInfo}>
                <Text style={[styles.barberName, selected && styles.barberNameSelected]}>{barber.name}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.barberRole}>{barber.role}</Text>
                </View>
                {schedule ? (
                  <View style={styles.slotInfo}>
                    <Ionicons name="time-outline" size={11} color={availableCount > 0 ? COLORS.primary : COLORS.subtext} />
                    <Text style={[styles.scheduleText, availableCount > 0 && styles.scheduleAvailable]}>
                      {availableCount} slot{availableCount !== 1 ? "s" : ""} available · {takenCount} taken
                    </Text>
                  </View>
                ) : (
                  <View style={styles.slotInfo}>
                    <Ionicons name="time-outline" size={11} color={COLORS.subtext} />
                    <Text style={styles.scheduleText}>Schedule not set</Text>
                  </View>
                )}
              </View>
              <View style={[styles.selectBadge, selected && styles.selectBadgeActive]}>
                {selected
                  ? <Ionicons name="checkmark" size={16} color={COLORS.background} />
                  : <Ionicons name="add" size={16} color={COLORS.subtext} />
                }
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>SUMMARY</Text>
          <View style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryServiceName}>{service || "—"}</Text>
              <Text style={styles.summaryDuration}>{duration}</Text>
            </View>
            <Text style={styles.summaryPrice}>{price}</Text>
          </View>
          {selectedIndex !== null && (
            <View style={styles.summaryBarberRow}>
              <Ionicons name="person-outline" size={13} color={COLORS.primary} />
              <Text style={styles.summaryBarberName}>{barbers[selectedIndex].name}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total to pay</Text>
            <Text style={styles.totalPrice}>{price}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, selectedIndex === null && styles.bookButtonDisabled]}
          activeOpacity={0.9}
          onPress={handleBook}
        >
          <Text style={styles.bookButtonText}>Continue</Text>
          {selectedIndex !== null && <Ionicons name="arrow-forward" size={16} color={COLORS.background} />}
        </TouchableOpacity>
      </View>
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
  content: { paddingHorizontal: 20, paddingBottom: 320 },
  heroTag: { color: COLORS.primary, fontSize: 11, fontWeight: "700", letterSpacing: 4, marginBottom: 8 },
  heroTitle: { color: COLORS.text, fontSize: 34, fontWeight: "900", lineHeight: 40, marginBottom: 16 },
  goldLine: { width: 50, height: 2, backgroundColor: COLORS.primary, borderRadius: 2, marginBottom: 24 },
  barberCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
    overflow: "hidden",
  },
  barberCardSelected: { borderColor: COLORS.primary, borderWidth: 1.5 },
  selectedAccent: {
    position: "absolute", left: 0, top: 0, bottom: 0,
    width: 3, backgroundColor: COLORS.primary,
  },
  barberAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#1a1500", borderWidth: 1.5, borderColor: COLORS.border,
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  barberAvatarSelected: { borderColor: COLORS.primary, backgroundColor: "#2a2000" },
  avatarText: { color: COLORS.primary, fontSize: 20, fontWeight: "900" },
  barberInfo: { flex: 1 },
  barberName: { color: COLORS.text, fontSize: 15, fontWeight: "700", marginBottom: 5 },
  barberNameSelected: { color: COLORS.primary },
  roleBadge: {
    alignSelf: "flex-start", backgroundColor: "#111",
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginBottom: 6,
  },
  barberRole: { color: COLORS.subtext, fontSize: 10, fontWeight: "600", letterSpacing: 1 },
  slotInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  scheduleText: { color: COLORS.subtext, fontSize: 11 },
  scheduleAvailable: { color: COLORS.primary },
  selectBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center",
  },
  selectBadgeActive: { backgroundColor: COLORS.primary },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 20, backgroundColor: COLORS.background },
  summaryCard: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  summaryLabel: { color: COLORS.primary, fontSize: 10, fontWeight: "700", letterSpacing: 3, marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  summaryServiceName: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  summaryDuration: { color: COLORS.subtext, fontSize: 12, marginTop: 2 },
  summaryPrice: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
  summaryBarberRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  summaryBarberName: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalLabel: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  totalPrice: { color: COLORS.primary, fontSize: 15, fontWeight: "700" },
  bookButton: {
    backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16,
    alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8,
  },
  bookButtonDisabled: { backgroundColor: COLORS.border },
  bookButtonText: { color: COLORS.background, fontSize: 15, fontWeight: "800", letterSpacing: 1 },
});
