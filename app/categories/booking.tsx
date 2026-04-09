import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/colors";
import { db } from "../../services/firebase";

const TIME_SLOTS = [
  "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM",
  "2:00 PM",  "3:00 PM",
  "4:00 PM",  "5:00 PM",
  "6:00 PM",  "7:00 PM",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: { day: number; currentMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrev - i, currentMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, currentMonth: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++)
    cells.push({ day: d, currentMonth: false });
  return cells;
}

export default function Booking() {
  const { service, price, duration, barber, rescheduleId, rescheduleEmail, rescheduleFullName } =
    useLocalSearchParams<{
      service: string; price: string; duration: string; barber: string;
      rescheduleId?: string; rescheduleEmail?: string; rescheduleFullName?: string;
    }>();

  const isReschedule = !!rescheduleId;

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDate || !barber) return;
    const dateStr = selectedDate.toISOString().split("T")[0];
    const q = query(
      collection(db, "bookings"),
      where("barber", "==", barber),
      where("date", "==", dateStr),
      where("status", "==", "confirmed")
    );
    const unsub = onSnapshot(q, (snap) => {
      setTakenSlots(snap.docs.map((d) => d.data().time as string));
    });
    return unsub;
  }, [selectedDate, barber]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function selectDay(day: number, currentMonth: boolean) {
    if (!currentMonth) return;
    const d = new Date(viewYear, viewMonth, day);
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (d < todayMid) return;
    setSelectedDate(d);
    setSelectedTime(null);
  }

  async function handleConfirm() {
    if (!selectedDate || !selectedTime) return;
    setLoading(true);

    if (isReschedule && rescheduleId) {
      try {
        const newDate = formatSelectedDate();
        await updateDoc(doc(db, "bookings", rescheduleId), {
          date: newDate,
          time: selectedTime,
          status: "confirmed",
          rescheduledAt: new Date().toISOString(),
        });

        Alert.alert(
          "Rescheduled",
          `Your appointment has been rescheduled to ${newDate} at ${selectedTime}.`,
          [{ text: "OK", onPress: () => router.replace("/profile") }]
        );
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to reschedule. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    router.push({
      pathname: "/categories/details" as any,
      params: { service, price, duration, barber, date: formatSelectedDate(), time: selectedTime },
    });
    setLoading(false);
  }

  function formatSelectedDate() {
    if (!selectedDate) return "";
    return `${DAY_NAMES[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`;
  }

  const cells = buildCalendar(viewYear, viewMonth);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>{isReschedule ? "Reschedule" : "Select a time"}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.serviceLabel}>{service}</Text>

          <View style={styles.calendarTimeRow}>
            <View style={styles.calendarSection}>
              <View style={styles.monthNav}>
                <Text style={styles.monthLabel}>
                  <Text style={styles.monthBold}>{MONTH_NAMES[viewMonth].slice(0, 3)} </Text>
                  <Text style={styles.monthYear}>{viewYear}</Text>
                </Text>
                <View style={styles.navButtons}>
                  <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                    <Text style={styles.navBtnText}>‹</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                    <Text style={styles.navBtnText}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.dayHeaders}>
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <Text key={i} style={styles.dayHeader}>{d}</Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {cells.map((cell, i) => {
                  const offset = cell.currentMonth ? 0 : cell.day < 15 ? 1 : -1;
                  const cellDate = new Date(viewYear, viewMonth + offset, cell.day);
                  const isPast = cellDate < todayMidnight;
                  const isSelected =
                    !!selectedDate &&
                    cell.currentMonth &&
                    selectedDate.getDate() === cell.day &&
                    selectedDate.getMonth() === viewMonth &&
                    selectedDate.getFullYear() === viewYear;
                  const isToday =
                    cell.currentMonth &&
                    cell.day === today.getDate() &&
                    viewMonth === today.getMonth() &&
                    viewYear === today.getFullYear();
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.dayCell,
                        isSelected && styles.dayCellSelected,
                        isToday && !isSelected && styles.dayCellToday,
                      ]}
                      onPress={() => selectDay(cell.day, cell.currentMonth)}
                      disabled={!cell.currentMonth || isPast}
                    >
                      <Text style={[
                        styles.dayCellText,
                        (!cell.currentMonth || isPast) && styles.dayCellFaded,
                        isSelected && styles.dayCellTextSelected,
                      ]}>
                        {cell.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.timezoneLabel}>Time zone</Text>
              <View style={styles.timezoneBox}>
                <Text style={styles.timezoneText}>Philippines – Manila</Text>
                <Text style={styles.timezoneChevron}>⌄</Text>
              </View>
            </View>

            <View style={styles.timeSection}>
              {selectedDate ? (
                <>
                  <Text style={styles.selectedDateLabel}>{formatSelectedDate()}</Text>
                  <View style={styles.slotsGrid}>
                    {TIME_SLOTS.map((slot) => {
                      const taken = takenSlots.includes(slot);
                      const active = selectedTime === slot;
                      return (
                        <TouchableOpacity
                          key={slot}
                          style={[
                            styles.slotBtn,
                            active && styles.slotBtnActive,
                            taken && styles.slotBtnTaken,
                          ]}
                          onPress={() => !taken && setSelectedTime(slot)}
                          disabled={taken}
                        >
                          <Text style={[
                            styles.slotText,
                            active && styles.slotTextActive,
                            taken && styles.slotTextTaken,
                          ]}>
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              ) : (
                <Text style={styles.pickDateHint}>Pick a date</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>

          <View style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryServiceName}>{service}</Text>
              <Text style={styles.summaryMeta}>{duration} · {price}</Text>
            </View>
            <Text style={styles.summaryPrice}>{price}</Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryServiceName}>{barber}</Text>
            </View>
          </View>

          {(selectedDate || selectedTime) && (
            <View style={styles.summaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryMeta}>
                  {selectedDate ? formatSelectedDate() : "No date"}{selectedTime ? ` · ${selectedTime}` : ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => { setSelectedDate(null); setSelectedTime(null); }}
                style={styles.editBtn}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total to pay</Text>
            <Text style={styles.totalPrice}>{price}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, (!selectedDate || !selectedTime) && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!selectedDate || !selectedTime || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmBtnText}>{isReschedule ? "Confirm Reschedule" : "Confirm Booking"}</Text>
          }
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
  content: { paddingHorizontal: 16, paddingBottom: 320 },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 16 },
  serviceLabel: { color: COLORS.text, fontSize: 18, fontWeight: "700", marginBottom: 16 },
  calendarTimeRow: { flexDirection: "row", gap: 12 },
  calendarSection: { flex: 1 },
  monthNav: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10,
  },
  monthLabel: { fontSize: 14 },
  monthBold: { color: COLORS.text, fontWeight: "700" },
  monthYear: { color: COLORS.subtext },
  navButtons: { flexDirection: "row", gap: 4 },
  navBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center",
  },
  navBtnText: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  dayHeaders: { flexDirection: "row", marginBottom: 4 },
  dayHeader: { flex: 1, textAlign: "center", color: COLORS.subtext, fontSize: 11 },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: "14.28%", aspectRatio: 1,
    justifyContent: "center", alignItems: "center", borderRadius: 100,
  },
  dayCellSelected: { backgroundColor: COLORS.text },
  dayCellToday: { borderWidth: 1, borderColor: COLORS.text },
  dayCellText: { color: COLORS.text, fontSize: 12 },
  dayCellTextSelected: { color: COLORS.background, fontWeight: "700" },
  dayCellFaded: { color: COLORS.border },
  timezoneLabel: { color: COLORS.subtext, fontSize: 12, marginTop: 12, marginBottom: 6 },
  timezoneBox: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  timezoneText: { color: COLORS.text, fontSize: 13 },
  timezoneChevron: { color: COLORS.subtext, fontSize: 14 },
  timeSection: { flex: 1 },
  selectedDateLabel: { color: COLORS.text, fontSize: 13, fontWeight: "700", marginBottom: 10 },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slotBtn: {
    width: "47%", paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border, alignItems: "center",
  },
  slotBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotBtnTaken: { backgroundColor: COLORS.border, borderColor: COLORS.border, opacity: 0.4 },
  slotText: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  slotTextActive: { color: "#fff" },
  slotTextTaken: { color: COLORS.subtext, textDecorationLine: "line-through" },
  pickDateHint: { color: COLORS.subtext, fontSize: 13, marginTop: 20 },
  footer: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    padding: 20, backgroundColor: COLORS.background,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 16,
    borderRadius: 16, alignItems: "center",
  },
  confirmBtnDisabled: { backgroundColor: COLORS.border },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  summaryTitle: { color: COLORS.text, fontSize: 15, fontWeight: "700", marginBottom: 12 },
  summaryRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  summaryServiceName: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  summaryMeta: { color: COLORS.subtext, fontSize: 13, marginTop: 2 },
  summaryPrice: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalLabel: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  totalPrice: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  editBtn: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  editBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: "700" },
});
