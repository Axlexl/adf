import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    Modal,
    Image as RNImage,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS } from "../constants/colors";
import { auth, db } from "../services/firebase";

const SHOP_ADDRESS =
  "Vinzon Street Obrero, ALT BUILDING Second floor Davao City, Davao Del Sur 8000";

const ADMIN_EMAIL = "admin@alldayfade.com";

type Booking = {
  id: string;
  bookingId: string;
  service: string;
  duration: string;
  price: string;
  barber: string;
  date: string;
  time: string;
  status: string;
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  createdAt: string;
  isoDate?: string;
};

type CancellationRecord = { id: string; bookingId: string; service: string; barber: string; date: string; time: string; cancelledAt: string; uid?: string };
type RescheduleRecord = { id: string; bookingId: string; service: string; barber: string; newDate: string; newTime: string; rescheduledAt: string; uid?: string };

type Section = "appointments" | "details" | "transactions" | "cancellations" | "reschedules";
type Tab = "upcoming" | "past";

// Parse the appointment date string (e.g. "Sun 26 April" or "Fri 10 April") into a Date
function parseAppointmentDate(dateStr: string, timeStr: string): Date {
  try {
    // dateStr format: "Sun 26 April" — extract day and month
    const parts = dateStr.trim().split(" ");
    // parts[0] = day name, parts[1] = day number, parts[2] = month name
    const day = parseInt(parts[1]);
    const monthName = parts[2];
    const months: Record<string, number> = {
      January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
      July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
    };
    const month = months[monthName] ?? 0;
    const year = new Date().getFullYear();

    // Parse time e.g. "2:00 PM"
    const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hours = timeParts ? parseInt(timeParts[1]) : 0;
    const minutes = timeParts ? parseInt(timeParts[2]) : 0;
    const ampm = timeParts ? timeParts[3].toUpperCase() : "AM";
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    return new Date(year, month, day, hours, minutes);
  } catch {
    return new Date(0);
  }
}

// Use isoDate if available, otherwise fall back to createdAt
function getBookingTimestamp(b: Booking): number {
  if (b.isoDate) return new Date(b.isoDate).getTime();
  return new Date(b.createdAt).getTime();
}

export default function Profile() {
  const user = auth.currentUser;
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [section, setSection] = useState<Section>("appointments");
  const [tab, setTab] = useState<Tab>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allTransactions, setAllTransactions] = useState<Booking[]>([]);
  const [allCancellations, setAllCancellations] = useState<CancellationRecord[]>([]);
  const [allReschedules, setAllReschedules] = useState<RescheduleRecord[]>([]);
  const [txTab, setTxTab] = useState<"upcoming" | "past">("upcoming");
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const latestBooking = bookings[0] ?? null;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "bookings"), where("uid", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const sorted = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, "id">) }))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setBookings(sorted);
        setLoadingBookings(false);
      },
      (err) => {
        console.warn("Firestore error:", err);
        setLoadingBookings(false);
      }
    );

    // Load profile photo
    const uid = user.uid;
    const unsubUser = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists() && snap.data().photoUri) {
        setPhotoUri(snap.data().photoUri);
      }
    });

    // Load ALL bookings + cancellations + reschedules for admin
    let unsubAdmin = () => {};
    let unsubCan = () => {};
    let unsubRes = () => {};
    if (user.email === ADMIN_EMAIL) {
      unsubAdmin = onSnapshot(collection(db, "bookings"), (snap) => {
        setAllTransactions(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, "id">) }))
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        );
      });
      unsubCan = onSnapshot(collection(db, "cancellations"), (snap) => {
        setAllCancellations(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<CancellationRecord, "id">) }))
            .sort((a, b) => b.cancelledAt.localeCompare(a.cancelledAt))
        );
      });
      unsubRes = onSnapshot(collection(db, "reschedules"), (snap) => {
        setAllReschedules(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<RescheduleRecord, "id">) }))
            .sort((a, b) => b.rescheduledAt.localeCompare(a.rescheduledAt))
        );
      });
    }

    return () => { unsub(); unsubUser(); unsubAdmin(); unsubCan(); unsubRes(); };
  }, [user?.uid]);

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhotoUri(uri);
      const uid = auth.currentUser?.uid;
      if (uid) {
        setDoc(doc(db, "users", uid), { photoUri: uri }, { merge: true })
          .catch(() => {});
      }
    }
  }

  const now = Date.now();
  const active = bookings.filter((b) => b.status !== "cancelled");
  const upcoming = active.filter((b) => parseAppointmentDate(b.date, b.time).getTime() >= now);
  const past = active.filter((b) => parseAppointmentDate(b.date, b.time).getTime() < now);
  const displayed = tab === "upcoming" ? upcoming : past;

  async function handleLogout() {
    Alert.alert(
      "Log out",
      "Do you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, log out",
          style: "destructive",
          onPress: async () => {
            await signOut(auth);
            router.replace("/");
          },
        },
      ]
    );
  }

  function handleCancel(booking: Booking) {
    setCancelTarget(booking);
    setSelectedBooking(null);
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await updateDoc(doc(db, "bookings", cancelTarget.id), { status: "cancelled" });

      // Log to cancellations collection
      addDoc(collection(db, "cancellations"), {
        bookingId: cancelTarget.bookingId,
        uid: auth.currentUser?.uid ?? null,
        service: cancelTarget.service,
        barber: cancelTarget.barber,
        date: cancelTarget.date,
        time: cancelTarget.time,
        cancelledAt: new Date().toISOString(),
      }).catch(() => {});

      setCancelTarget(null);
      setShowCancelSuccess(true);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not cancel. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  }

  function handleReschedule(booking: Booking) {
    setSelectedBooking(null);
    router.push({
      pathname: "/categories/booking" as any,
      params: {
        service: booking.service,
        price: booking.price,
        duration: booking.duration,
        barber: booking.barber,
        rescheduleId: booking.id,
        rescheduleEmail: booking.email ?? "",
        rescheduleFullName: booking.fullName ?? "",
      },
    });
  }

  function copyId(id: string) {
    Clipboard.setString(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayName =
    latestBooking?.fullName || user?.email?.split("@")[0] || "Client";
  const displayEmail = user?.email || "";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/home")}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* User info strip */}
      <View style={styles.userStrip}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{displayEmail}</Text>
        </View>
      </View>

      {/* Section tabs — horizontal scroll so they don't overflow */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sectionTabsScroll}
        contentContainerStyle={styles.sectionTabs}
      >
        <TouchableOpacity
          style={[styles.sectionTab, section === "appointments" && styles.sectionTabActive]}
          onPress={() => setSection("appointments")}
        >
          <Text style={[styles.sectionTabText, section === "appointments" && styles.sectionTabTextActive]}>
            Appointments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionTab, section === "details" && styles.sectionTabActive]}
          onPress={() => setSection("details")}
        >
          <Text style={[styles.sectionTabText, section === "details" && styles.sectionTabTextActive]}>
            Your details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sectionTab} onPress={handleLogout}>
          <Text style={styles.sectionTabText}>Logout</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity
            style={[styles.sectionTab, section === "transactions" && styles.sectionTabActive]}
            onPress={() => setSection("transactions")}
          >
            <Text style={[styles.sectionTabText, section === "transactions" && styles.sectionTabTextActive]}>
              Transactions
            </Text>
          </TouchableOpacity>
        )}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.sectionTab, section === "cancellations" && styles.sectionTabActive]}
            onPress={() => setSection("cancellations")}
          >
            <Text style={[styles.sectionTabText, section === "cancellations" && styles.sectionTabTextActive]}>
              Cancels
            </Text>
          </TouchableOpacity>
        )}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.sectionTab, section === "reschedules" && styles.sectionTabActive]}
            onPress={() => setSection("reschedules")}
          >
            <Text style={[styles.sectionTabText, section === "reschedules" && styles.sectionTabTextActive]}>
              Reschedules
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Appointments ── */}
        {section === "appointments" && (
          <>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tabBtn, tab === "upcoming" && styles.tabBtnActive]}
                onPress={() => setTab("upcoming")}
              >
                <Text style={[styles.tabText, tab === "upcoming" && styles.tabTextActive]}>
                  Upcoming
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, tab === "past" && styles.tabBtnActive]}
                onPress={() => setTab("past")}
              >
                <Text style={[styles.tabText, tab === "past" && styles.tabTextActive]}>
                  Past
                </Text>
              </TouchableOpacity>
            </View>

            {loadingBookings ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
            ) : displayed.length === 0 ? (
              <Text style={styles.emptyText}>
                {tab === "upcoming"
                  ? "No upcoming appointments."
                  : "No past appointments."}
              </Text>
            ) : (
              displayed.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={styles.appointmentCard}
                  onPress={() => setSelectedBooking(b)}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardTop}>
                    <Text style={styles.appointmentDate}>{b.date}</Text>
                    <Text style={styles.appointmentTime}>{b.time}</Text>
                  </View>
                  <View style={styles.cardDivider} />
                  <View style={styles.cardBottom}>
                    <View style={styles.serviceIcon}>
                      <Text style={styles.serviceIconText}>ADF</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.appointmentService}>{b.service}</Text>
                      <Text style={styles.appointmentMeta}>
                        {b.duration} · {b.price} · with {b.barber}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

        {/* ── Details ── */}
        {section === "details" && (
          <View style={styles.detailsCard}>
            {/* Profile picture */}
            <TouchableOpacity style={styles.photoPicker} onPress={pickPhoto}>
              {photoUri ? (
                <RNImage source={{ uri: photoUri }} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={28} color={COLORS.subtext} />
                  <Text style={styles.photoPlaceholderText}>Add photo</Text>
                </View>
              )}
              <View style={styles.photoEditBadge}>
                <Ionicons name="pencil" size={11} color="#fff" />
              </View>
            </TouchableOpacity>

            {latestBooking ? (
              <>
                <DetailRow label="Full Name" value={latestBooking.fullName} />
                <DetailRow label="Phone" value={latestBooking.phone} />
                <DetailRow label="Email" value={latestBooking.email} />
                <DetailRow label="Address" value={latestBooking.address} />
                <DetailRow label="City" value={latestBooking.city} />
                <DetailRow label="Province" value={latestBooking.province} />
                <DetailRow label="Postal Code" value={latestBooking.postalCode} />
              </>
            ) : (
              <Text style={styles.emptyText}>
                No details yet. Complete a booking first.
              </Text>
            )}
          </View>
        )}

        {/* ── Transactions (admin only) ── */}
        {section === "transactions" && isAdmin && (
          <>
            {/* Upcoming / Past sub-tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tabBtn, txTab === "upcoming" && styles.tabBtnActive]}
                onPress={() => setTxTab("upcoming")}
              >
                <Text style={[styles.tabText, txTab === "upcoming" && styles.tabTextActive]}>Upcoming</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, txTab === "past" && styles.tabBtnActive]}
                onPress={() => setTxTab("past")}
              >
                <Text style={[styles.tabText, txTab === "past" && styles.tabTextActive]}>Past</Text>
              </TouchableOpacity>
            </View>

            {(() => {
              const nowMs = Date.now();
              const filtered = allTransactions.filter((b) => {
                const ts = parseAppointmentDate(b.date, b.time).getTime();
                return txTab === "upcoming" ? ts >= nowMs : ts < nowMs;
              });
              if (filtered.length === 0)
                return <Text style={styles.emptyText}>No {txTab} bookings.</Text>;
              return filtered.map((b) => (
                <View key={b.id} style={styles.appointmentCard}>
                  <View style={styles.cardTop}>
                    <Text style={styles.appointmentDate}>{b.fullName ?? "Client"}</Text>
                    <Text style={styles.appointmentTime}>{b.email}</Text>
                  </View>
                  <View style={styles.cardDivider} />
                  <View style={styles.cardBottom}>
                    <View style={styles.serviceIcon}>
                      <Text style={styles.serviceIconText}>ADF</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.appointmentService}>{b.service}</Text>
                      <Text style={styles.appointmentMeta}>{b.barber} · {b.date} · {b.time}</Text>
                      <Text style={styles.appointmentMeta}>{b.price} · {b.status}</Text>
                    </View>
                  </View>
                </View>
              ));
            })()}
          </>
        )}

        {/* ── Cancellations (admin only) ── */}
        {section === "cancellations" && isAdmin && (
          <>
            <Text style={[styles.appointmentService, { marginBottom: 12 }]}>
              Total cancellations: {allCancellations.length}
            </Text>
            {allCancellations.length === 0 ? (
              <Text style={styles.emptyText}>No cancellations yet.</Text>
            ) : (
              allCancellations.map((c) => (
                <View key={c.id} style={styles.appointmentCard}>
                  <View style={styles.cardTop}>
                    <Text style={styles.appointmentDate}>{c.service}</Text>
                    <Text style={styles.appointmentTime}>ID: {c.bookingId}</Text>
                  </View>
                  <View style={styles.cardDivider} />
                  <View style={styles.cardBottom}>
                    <View style={styles.serviceIcon}>
                      <Text style={styles.serviceIconText}>ADF</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.appointmentService}>{c.barber}</Text>
                      <Text style={styles.appointmentMeta}>Was: {c.date} at {c.time}</Text>
                      <Text style={styles.appointmentMeta}>
                        Cancelled: {new Date(c.cancelledAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ── Reschedules (admin only) ── */}
        {section === "reschedules" && isAdmin && (
          <>
            <Text style={[styles.appointmentService, { marginBottom: 12 }]}>
              Total reschedules: {allReschedules.length}
            </Text>
            {allReschedules.length === 0 ? (
              <Text style={styles.emptyText}>No reschedules yet.</Text>
            ) : (
              allReschedules.map((r) => (
                <View key={r.id} style={styles.appointmentCard}>
                  <View style={styles.cardTop}>
                    <Text style={styles.appointmentDate}>{r.service}</Text>
                    <Text style={styles.appointmentTime}>ID: {r.bookingId}</Text>
                  </View>
                  <View style={styles.cardDivider} />
                  <View style={styles.cardBottom}>
                    <View style={styles.serviceIcon}>
                      <Text style={styles.serviceIconText}>ADF</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.appointmentService}>{r.barber}</Text>
                      <Text style={styles.appointmentMeta}>New: {r.newDate} at {r.newTime}</Text>
                      <Text style={styles.appointmentMeta}>
                        Rescheduled: {new Date(r.rescheduledAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* ── Appointment detail modal ── */}
      <Modal
        visible={!!selectedBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setSelectedBooking(null)}
                style={styles.modalBack}
              >
                <Ionicons name="chevron-back" size={20} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Your appointment details</Text>
            </View>

            {selectedBooking && (
              <ScrollView>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Address</Text>
                  <Text style={styles.modalValueBold}>{SHOP_ADDRESS}</Text>
                </View>
                <View style={styles.modalDivider} />

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Date & time</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalValueBold}>
                      {selectedBooking.date} · {selectedBooking.time}
                    </Text>
                    <Text style={styles.modalValueSub}>Time zone (Asia/Manila)</Text>
                  </View>
                </View>
                <View style={styles.modalDivider} />

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Service</Text>
                  <View style={styles.modalServiceRow}>
                    <View style={styles.serviceIcon}>
                      <Text style={styles.serviceIconText}>ADF</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalValueBold}>
                        {selectedBooking.service}
                      </Text>
                      <Text style={styles.modalValueSub}>
                        {selectedBooking.duration} · with {selectedBooking.barber}
                      </Text>
                    </View>
                    <Text style={styles.modalPrice}>{selectedBooking.price}</Text>
                  </View>
                </View>
                <View style={styles.modalDivider} />

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Booking ID</Text>
                  <TouchableOpacity
                    style={styles.bookingIdRow}
                    onPress={() => copyId(selectedBooking.bookingId)}
                  >
                    <Text style={styles.modalValueBold}>
                      {selectedBooking.bookingId}
                    </Text>
                    <Text style={styles.copyIcon}>{copied ? "✓" : "⧉"}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.rescheduleBtn}
                    onPress={() => handleReschedule(selectedBooking)}
                  >
                    <Text style={styles.rescheduleBtnText}>
                      Reschedule appointment
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(selectedBooking)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel appointment</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Cancel confirm modal ── */}
      <Modal
        visible={!!cancelTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelTarget(null)}
      >
        <View style={styles.cancelOverlay}>
          <View style={styles.cancelCard}>
            <TouchableOpacity
              style={styles.cancelClose}
              onPress={() => setCancelTarget(null)}
            >
              <Text style={styles.cancelCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.cancelTitle}>Cancel your appointment?</Text>
            <Text style={styles.cancelBody}>
              If something's come up, we understand. Please note that cancelling
              cannot be reversed.
            </Text>
            <View style={styles.cancelActions}>
              <TouchableOpacity
                onPress={() => setCancelTarget(null)}
                style={styles.keepBtn}
              >
                <Text style={styles.keepBtnText}>No, keep it</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmCancel}
                style={styles.yesCancelBtn}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.yesCancelBtnText}>Yes, cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Cancel success modal ── */}
      <Modal
        visible={showCancelSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelSuccess(false)}
      >
        <View style={styles.cancelOverlay}>
          <View style={styles.cancelCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.cancelTitle}>Appointment cancelled</Text>
            <Text style={styles.cancelBody}>
              Your appointment has been successfully cancelled.
            </Text>
            <TouchableOpacity
              style={styles.yesCancelBtn}
              onPress={() => setShowCancelSuccess(false)}
            >
              <Text style={styles.yesCancelBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.card, justifyContent: "center", alignItems: "center" },
  pageTitle: { color: COLORS.text, fontSize: 18, fontWeight: "bold" },
  placeholder: { width: 48 },

  // User strip
  userStrip: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingHorizontal: 20, paddingBottom: 16,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  // Photo picker in details section
  photoPicker: {
    alignSelf: "center", marginBottom: 20, position: "relative",
  },
  photoImage: {
    width: 90, height: 90, borderRadius: 45,
  },
  photoPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.border,
    justifyContent: "center", alignItems: "center",
  },
  photoPlaceholderText: { color: COLORS.subtext, fontSize: 11, marginTop: 4 },
  photoEditBadge: {
    position: "absolute", bottom: 2, right: 2,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: COLORS.card,
  },  userName: { color: COLORS.text, fontSize: 16, fontWeight: "800" },
  userEmail: { color: COLORS.subtext, fontSize: 12, marginTop: 2 },

  // Section tabs
  sectionTabsScroll: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexGrow: 0,
  },
  sectionTabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  sectionTab: { paddingVertical: 12, paddingHorizontal: 14, marginRight: 4 },
  sectionTabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.text },
  sectionTabText: { color: COLORS.subtext, fontSize: 13, fontWeight: "600" },
  sectionTabTextActive: { color: COLORS.text, fontWeight: "700" },

  content: { padding: 20, paddingBottom: 40 },

  // Appointment tabs
  tabs: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tabBtn: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20, backgroundColor: COLORS.card,
  },
  tabBtnActive: { backgroundColor: COLORS.text },
  tabText: { color: COLORS.subtext, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: COLORS.background, fontWeight: "700" },

  // Appointment card — vertical layout
  appointmentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  cardTop: { marginBottom: 10 },
  appointmentDate: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  appointmentTime: { color: COLORS.subtext, fontSize: 13, marginTop: 2 },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: 10 },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: 12 },
  serviceIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: "#222", justifyContent: "center", alignItems: "center",
  },
  serviceIconText: { color: COLORS.text, fontSize: 8, fontWeight: "900" },
  cardInfo: { flex: 1 },
  appointmentService: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  appointmentMeta: { color: COLORS.subtext, fontSize: 12, marginTop: 3 },
  emptyText: { color: COLORS.subtext, fontSize: 14, marginTop: 8 },

  // Details card
  detailsCard: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16, gap: 4,
  },
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  detailLabel: { color: COLORS.subtext, fontSize: 11, marginBottom: 3 },
  detailValue: { color: COLORS.text, fontSize: 14, fontWeight: "600" },

  // Appointment detail modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20,
  },
  modalBack: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center",
  },
  modalTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  modalRow: {
    flexDirection: "row", alignItems: "flex-start",
    paddingVertical: 14, gap: 12,
  },
  modalLabel: { color: COLORS.subtext, fontSize: 13, width: 80, flexShrink: 0 },
  modalValueBold: { color: COLORS.text, fontSize: 13, fontWeight: "700", flex: 1 },
  modalValueSub: { color: COLORS.subtext, fontSize: 12, marginTop: 3 },
  modalDivider: { height: 1, backgroundColor: COLORS.border },
  modalServiceRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  modalPrice: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  bookingIdRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  copyIcon: { color: COLORS.subtext, fontSize: 16 },
  modalActions: {
    flexDirection: "column", gap: 10, marginTop: 24, marginBottom: 8,
  },
  rescheduleBtn: {
    paddingVertical: 14, borderRadius: 30,
    borderWidth: 1.5, borderColor: COLORS.text, alignItems: "center",
  },
  rescheduleBtnText: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  cancelBtn: {
    paddingVertical: 14, borderRadius: 30, alignItems: "center",
  },
  cancelBtnText: { color: COLORS.subtext, fontSize: 14 },

  // Cancel modals
  cancelOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  cancelCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 24, width: "100%",
  },
  cancelClose: { position: "absolute", top: 16, right: 16, padding: 4 },
  cancelCloseText: { color: COLORS.subtext, fontSize: 16 },
  cancelTitle: {
    color: COLORS.text, fontSize: 17, fontWeight: "700",
    marginBottom: 12, marginTop: 4,
  },
  cancelBody: { color: COLORS.subtext, fontSize: 13, lineHeight: 20, marginBottom: 24 },
  cancelActions: {
    flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 16,
  },
  keepBtn: { paddingVertical: 10, paddingHorizontal: 4 },
  keepBtnText: { color: COLORS.subtext, fontSize: 14 },
  yesCancelBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 30, alignItems: "center",
  },
  yesCancelBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  successIcon: {
    fontSize: 36, textAlign: "center", marginBottom: 12, color: COLORS.primary,
  },
});
