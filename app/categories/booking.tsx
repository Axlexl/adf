import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import PageLoader from "../../components/ui/PageLoader";
import { COLORS } from "../../constants/colors";
import { db } from "../../services/firebase";

const TIMEZONES = [
  { label: "Philippines – Manila", offset: 8 },
  { label: "Japan – Tokyo", offset: 9 },
  { label: "Singapore", offset: 8 },
  { label: "Australia – Sydney", offset: 10 },
  { label: "UAE – Dubai", offset: 4 },
  { label: "UK – London", offset: 1 },
  { label: "USA – New York", offset: -4 },
  { label: "USA – Los Angeles", offset: -7 },
];

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
  const { service, price, duration, barber, rescheduleId, rescheduleEmail, rescheduleFullName, oldDate, oldTime } =
    useLocalSearchParams<{
      service: string; price: string; duration: string; barber: string;
      rescheduleId?: string; rescheduleEmail?: string; rescheduleFullName?: string;
      oldDate?: string; oldTime?: string;
    }>();

  const isReschedule = !!rescheduleId;

  useEffect(() => {
    const timer = setTimeout(() => setPageReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [showRescheduleSuccess, setShowRescheduleSuccess] = useState(false);
  const [rescheduledTo, setRescheduledTo] = useState("");
  const [selectedTz, setSelectedTz] = useState(TIMEZONES[0]);
  const [showTzPicker, setShowTzPicker] = useState(false);

  useEffect(() => {
    if (!selectedDate || !barber) return;    const formattedDate = `${DAY_NAMES[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`;
    // Query only by barber + date — no status filter to avoid needing a composite index
    const q = query(
      collection(db, "bookings"),
      where("barber", "==", barber),
      where("date", "==", formattedDate)
    );
    const unsub = onSnapshot(q, (snap) => {
      // Filter confirmed/rescheduled client-side, exclude the booking being rescheduled
      const taken = snap.docs
        .filter((d) => {
          const status = d.data().status as string;
          const isCurrentBooking = isReschedule && d.id === rescheduleId;
          return !isCurrentBooking && (status === "confirmed" || status === "rescheduled");
        })
        .map((d) => d.data().time as string);
      setTakenSlots(taken);
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
          timezone: selectedTz.label,
          status: "confirmed",
          rescheduledAt: new Date().toISOString(),
        });

        // Log to reschedules collection with old and new date
        addDoc(collection(db, "reschedules"), {
          bookingId: rescheduleId,
          uid: rescheduleEmail ?? null,
          service, barber,
          oldDate: oldDate ?? "",
          oldTime: oldTime ?? "",
          newDate,
          newTime: selectedTime,
          rescheduledAt: new Date().toISOString(),
        }).catch(() => {});

        setRescheduledTo(`${newDate} at ${selectedTime}`);
        setShowRescheduleSuccess(true);
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
      params: { service, price, duration, barber, date: formatSelectedDate(), time: selectedTime, timezone: selectedTz.label },
    });
    setLoading(false);
  }

  function formatSelectedDate() {
    if (!selectedDate) return "";
    return `${DAY_NAMES[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`;
  }

  const cells = buildCalendar(viewYear, viewMonth);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (!pageReady) return <PageLoader />;

  return (
  <>
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
              <TouchableOpacity style={styles.timezoneBox} onPress={() => setShowTzPicker(true)}>
                <Text style={styles.timezoneText}>{selectedTz.label}</Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.subtext} />
              </TouchableOpacity>
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

    {/* Timezone picker modal */}
    <Modal visible={showTzPicker} transparent animationType="slide" onRequestClose={() => setShowTzPicker(false)}>
      <View style={styles.tzOverlay}>
        <View style={styles.tzSheet}>
          <View style={styles.tzHeader}>
            <Text style={styles.tzTitle}>Select Time Zone</Text>
            <TouchableOpacity onPress={() => setShowTzPicker(false)}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          {TIMEZONES.map((tz) => (
            <TouchableOpacity
              key={tz.label}
              style={[styles.tzOption, selectedTz.label === tz.label && styles.tzOptionActive]}
              onPress={() => { setSelectedTz(tz); setShowTzPicker(false); }}
            >
              <Text style={[styles.tzOptionText, selectedTz.label === tz.label && styles.tzOptionTextActive]}>
                {tz.label}
              </Text>
              <Text style={styles.tzOffset}>UTC+{tz.offset}</Text>
              {selectedTz.label === tz.label && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>

    {/* Reschedule success modal */}
    {showRescheduleSuccess && (
      <View style={styles.successOverlay}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Appointment Rescheduled</Text>
          <Text style={styles.successBody}>
            Your appointment has been moved to{"\n"}{rescheduledTo}
          </Text>
          <TouchableOpacity
            style={styles.successBtn}
            onPress={() => {
              setShowRescheduleSuccess(false);
              router.replace("/profile");
            }}
          >
            <Text style={styles.successBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
  </>
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
  serviceLabel: { color: COLORS.primary, fontSize: 11, fontWeight: "700", letterSpacing: 3, marginBottom: 16 },
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
  dayCellSelected: { backgroundColor: COLORS.primary },
  dayCellToday: { borderWidth: 1, borderColor: COLORS.primary },
  dayCellText: { color: COLORS.text, fontSize: 12 },
  dayCellTextSelected: { color: COLORS.background, fontWeight: "700" },
  dayCellFaded: { color: COLORS.border },
  timezoneLabel: { color: COLORS.subtext, fontSize: 12, marginTop: 12, marginBottom: 6 },
  timezoneBox: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  timezoneText: { color: COLORS.text, fontSize: 12 },
  tzOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  tzSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  tzHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  tzTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  tzOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4,
  },
  tzOptionActive: { backgroundColor: "#1a1500" },
  tzOptionText: { color: COLORS.subtext, fontSize: 14, flex: 1 },
  tzOptionTextActive: { color: COLORS.text, fontWeight: "700" },
  tzOffset: { color: COLORS.subtext, fontSize: 12, marginRight: 8 },
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
  summaryTitle: { color: COLORS.primary, fontSize: 10, fontWeight: "700", letterSpacing: 3, marginBottom: 12 },
  summaryRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  summaryServiceName: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  summaryMeta: { color: COLORS.subtext, fontSize: 13, marginTop: 2 },
  summaryPrice: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalLabel: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  totalPrice: { color: COLORS.primary, fontSize: 15, fontWeight: "700" },
  editBtn: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  editBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: "700" },
  successOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  successCard: {
    backgroundColor: COLORS.card, borderRadius: 20,
    padding: 28, width: "100%", alignItems: "center",
  },
  successIcon: { fontSize: 40, color: "#4caf50", marginBottom: 12 },
  successTitle: { color: COLORS.text, fontSize: 18, fontWeight: "700", marginBottom: 8 },
  successBody: { color: COLORS.subtext, fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  successBtn: {
    backgroundColor: COLORS.text, paddingVertical: 14,
    paddingHorizontal: 40, borderRadius: 30,
  },
  successBtnText: { color: COLORS.background, fontSize: 15, fontWeight: "700" },
});
