import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import PageLoader from "../components/ui/PageLoader";
import { COLORS } from "../constants/colors";
import { usePageLoader } from "../hooks/usePageLoader";
import { auth, db } from "../services/firebase";

const ADMIN_EMAIL = "admin@alldayfade.com";

type Service = { id: string; title: string; duration: string; price: string; details: string[] };
type Member = { id: string; name: string; role: string; description: string };
type BarberSchedule = { id: string; barberId: string; date: string; availableSlots: string[]; takenSlots: string[] };
type BookingTransaction = { id: string; bookingId: string; uid: string; service: string; price: string; barber: string; date: string; time: string; timezone?: string; status: string; fullName?: string; createdAt: string };
type Cancellation = { id: string; bookingId: string; service: string; barber: string; date: string; time: string; cancelledAt: string };
type Reschedule = { id: string; bookingId: string; service: string; barber: string; newDate: string; newTime: string; rescheduledAt: string };
type Tab = "services" | "team" | "schedules" | "transactions" | "cancellations" | "reschedules";

export default function Admin() {
  const user = auth.currentUser;

  // Guard — only admin can access
  if (user?.email !== ADMIN_EMAIL) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: COLORS.text, fontSize: 16 }}>Access denied.</Text>
          <TouchableOpacity onPress={() => router.replace("/home")} style={{ marginTop: 16 }}>
            <Text style={{ color: COLORS.primary }}>Go home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const [tab, setTab] = useState<Tab>("services");
  const [services, setServices] = useState<Service[]>([]);
  const [team, setTeam] = useState<Member[]>([]);
  const [schedules, setSchedules] = useState<BarberSchedule[]>([]);
  const [transactions, setTransactions] = useState<BookingTransaction[]>([]);
  const [cancellations, setCancellations] = useState<Cancellation[]>([]);
  const [reschedules, setReschedules] = useState<Reschedule[]>([]);
  const [loading, setLoading] = useState(true);
  const pageReady = usePageLoader(500);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; collection: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Service modal
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [sTitle, setSTitle] = useState("");
  const [sDuration, setSDuration] = useState("");
  const [sPrice, setSPrice] = useState("");
  const [sDetails, setSDetails] = useState("");

  // Transaction edit modal
  const [showTxModal, setShowTxModal] = useState(false);
  const [editingTx, setEditingTx] = useState<BookingTransaction | null>(null);
  const [txDate, setTxDate] = useState("");
  const [txTime, setTxTime] = useState("");
  const [txBarber, setTxBarber] = useState("");
  const [txStatus, setTxStatus] = useState("");

  // Schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<BarberSchedule | null>(null);
  const [schBarberId, setSchBarberId] = useState("");
  const [schDate, setSchDate] = useState("");
  const [schSlots, setSchSlots] = useState("");
  // Team modal
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [tName, setTName] = useState("");
  const [tRole, setTRole] = useState("");
  const [tDesc, setTDesc] = useState("");

  useEffect(() => {
    // No orderBy to avoid needing composite indexes — sort client-side
    const unsubS = onSnapshot(collection(db, "services"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) }))
        .sort((a, b) => a.title.localeCompare(b.title));
      setServices(list);
      setLoading(false);

      // Auto-seed services if empty
      if (snap.empty) {
        const defaultServices = [
          { title: "HAIR COLOR", duration: "1 hr", price: "₱800", details: ["BASIC COLORS BLACK BROWN", "WITH HAIRCUT"] },
          { title: "HAIR PERM", duration: "3 hrs", price: "₱2,500", details: ["Hair cut", "Perm", "Complimentary Wash"] },
          { title: "BEARD TRIM", duration: "30 mins", price: "₱100", details: ["Tapering facial hair to maintain a neat look"] },
          { title: "GUCCI", duration: "45 mins", price: "₱300", details: ["HAIRCUT & SHAMPOO WITH SLICK GROOM FINISH!"] },
          { title: "LONG TO SHORT", duration: "1 hr", price: "₱400", details: ["WOLF CUT, MOD CUTS etc.", "The service has Groom and Shampoo"] },
          { title: "BAPE", duration: "45 mins", price: "₱250", details: ["Haircut fades.", "clean trims etc", "Basic groom"] },
          { title: "House Call & Wedding Calls", duration: "3 hrs", price: "₱1,500", details: ["Home service and special event bookings."] },
        ];
        defaultServices.forEach((s) => addDoc(collection(db, "services"), s).catch(() => {}));
      }
    });

    const unsubT = onSnapshot(collection(db, "team"), (snap) => {
      setTeam(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Member, "id">) }))
        .sort((a, b) => a.name.localeCompare(b.name)));

      // Auto-seed team if empty
      if (snap.empty) {
        const defaultTeam = [
          { name: "Nat Nat", role: "Barber Artist", description: "Catch me up at ADF MAIN, ALT building Vinzon Street Obrero Davao City" },
          { name: "Kharel Patentis", role: "Senior Barber", description: "I am located at NEW MAIN ADF located ALT Building Vinzon Street Obrero Davao City" },
          { name: "Elmar", role: "Barber Artist", description: "ALLDAYFADE main alt bldg. vinzon obrero davao city" },
          { name: "Barber Jm", role: "Barber Artist", description: "Visit me at ALLDAYFADE for the freshest fades and styling." },
          { name: "Carl", role: "Barber Artist", description: "Find me at ALLDAYFADE on Vinzon Street for a sharp new look." },
          { name: "Jake", role: "Barber Artist", description: "Stop by ALLDAYFADE for expert cuts and fade styles." },
        ];
        defaultTeam.forEach((m) => addDoc(collection(db, "team"), m).catch(() => {}));
      }
    });
    const unsubSch = onSnapshot(collection(db, "barber_schedules"), (snap) => {
      setSchedules(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BarberSchedule, "id">) })));
    });
    const unsubTx = onSnapshot(collection(db, "transactions"), (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BookingTransaction, "id">) }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    });
    const unsubCan = onSnapshot(collection(db, "cancellations"), (snap) => {
      setCancellations(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Cancellation, "id">) }))
        .sort((a, b) => b.cancelledAt.localeCompare(a.cancelledAt)));
    });
    const unsubRes = onSnapshot(collection(db, "reschedules"), (snap) => {
      setReschedules(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Reschedule, "id">) }))
        .sort((a, b) => b.rescheduledAt.localeCompare(a.rescheduledAt)));
    });
    return () => { unsubS(); unsubT(); unsubSch(); unsubTx(); unsubCan(); unsubRes(); };
  }, []);

  // ── Services ──
  function openAddService() {
    setEditingService(null);
    setSTitle(""); setSDuration(""); setSPrice(""); setSDetails("");
    setShowServiceModal(true);
  }

  function openEditService(s: Service) {
    setEditingService(s);
    setSTitle(s.title); setSDuration(s.duration); setSPrice(s.price);
    setSDetails(s.details.join("\n"));
    setShowServiceModal(true);
  }

  async function saveService() {
    if (!sTitle.trim() || !sPrice.trim() || !sDuration.trim()) {
      Alert.alert("Required", "Title, duration and price are required.");
      return;
    }
    setSavingService(true);
    try {
      const data = {
        title: sTitle.trim(),
        duration: sDuration.trim(),
        price: sPrice.trim(),
        details: sDetails.split("\n").map((l) => l.trim()).filter(Boolean),
      };
      if (editingService) {
        await updateDoc(doc(db, "services", editingService.id), data);
      } else {
        await addDoc(collection(db, "services"), data);
      }
      setShowServiceModal(false);
      Alert.alert("Success", editingService ? "Service updated." : "Service added.");
    } catch (err) {
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setSavingService(false);
    }
  }

  function deleteService(s: Service) {
    setDeleteTarget({ id: s.id, name: s.title, collection: "services" });
  }

  // ── Team ──
  function openAddMember() {
    setEditingMember(null);
    setTName(""); setTRole(""); setTDesc("");
    setShowTeamModal(true);
  }

  function openEditMember(m: Member) {
    setEditingMember(m);
    setTName(m.name); setTRole(m.role); setTDesc(m.description ?? "");
    setShowTeamModal(true);
  }

  async function saveMember() {
    if (!tName.trim() || !tRole.trim()) {
      Alert.alert("Required", "Name and role are required.");
      return;
    }
    setSavingMember(true);
    try {
      const data = { name: tName.trim(), role: tRole.trim(), description: tDesc.trim() };
      if (editingMember) {
        await updateDoc(doc(db, "team", editingMember.id), data);
      } else {
        await addDoc(collection(db, "team"), data);
      }
      setShowTeamModal(false);
      Alert.alert("Success", editingMember ? "Member updated." : "Member added.");
    } catch {
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setSavingMember(false);
    }
  }

  function deleteMember(m: Member) {
    setDeleteTarget({ id: m.id, name: m.name, collection: "team" });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, deleteTarget.collection, deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  // ── Schedules ──
  function openAddSchedule() {
    setEditingSchedule(null);
    setSchBarberId(""); setSchDate(""); setSchSlots("");
    setShowScheduleModal(true);
  }

  function openEditSchedule(s: BarberSchedule) {
    setEditingSchedule(s);
    setSchBarberId(s.barberId);
    setSchDate(s.date);
    setSchSlots(s.availableSlots.join(", "));
    setShowScheduleModal(true);
  }

  async function saveSchedule() {
    if (!schBarberId.trim() || !schDate.trim()) {
      Alert.alert("Required", "Barber name and date are required.");
      return;
    }
    const slots = schSlots.split(",").map((s) => s.trim()).filter(Boolean);
    const data = { barberId: schBarberId.trim(), date: schDate.trim(), availableSlots: slots, takenSlots: editingSchedule?.takenSlots ?? [] };
    if (editingSchedule) {
      await updateDoc(doc(db, "barber_schedules", editingSchedule.id), data);
    } else {
      await addDoc(collection(db, "barber_schedules"), data);
    }
    setShowScheduleModal(false);
  }

  function deleteSchedule(s: BarberSchedule) {
    Alert.alert("Delete schedule", `Remove schedule for ${s.barberId} on ${s.date}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, "barber_schedules", s.id)) },
    ]);
  }

  async function updateTransactionStatus(tx: BookingTransaction, status: string) {
    await updateDoc(doc(db, "transactions", tx.id), { status });
    // Also update the linked booking so client sees the change
    if (tx.bookingId) {
      const { getDocs, query: fsQuery, where } = await import("firebase/firestore");
      const snap = await getDocs(fsQuery(collection(db, "bookings"), where("bookingId", "==", tx.bookingId)));
      snap.forEach((d) => updateDoc(doc(db, "bookings", d.id), { status }));
    }
  }

  function openEditTx(tx: BookingTransaction) {
    setEditingTx(tx);
    setTxDate(tx.date);
    setTxTime(tx.time);
    setTxBarber(tx.barber);
    setTxStatus(tx.status);
    setShowTxModal(true);
  }

  async function saveTx() {
    if (!editingTx) return;
    const data = { date: txDate.trim(), time: txTime.trim(), barber: txBarber.trim(), status: txStatus.trim() };
    await updateDoc(doc(db, "transactions", editingTx.id), data);
    // Sync changes to the booking so client profile reflects them
    const { getDocs, query: fsQuery, where } = await import("firebase/firestore");
    const snap = await getDocs(fsQuery(collection(db, "bookings"), where("bookingId", "==", editingTx.bookingId)));
    snap.forEach((d) => updateDoc(doc(db, "bookings", d.id), data));
    setShowTxModal(false);
  }

  if (!pageReady) return <PageLoader />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/home")}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTag}>MANAGEMENT</Text>
          <Text style={styles.pageTitle}>Admin Panel</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, borderBottomWidth: 1, borderBottomColor: COLORS.border }}
        contentContainerStyle={styles.tabs}
      >
        <TouchableOpacity style={[styles.tabBtn, tab === "services" && styles.tabBtnActive]} onPress={() => setTab("services")}>
          <Text style={[styles.tabText, tab === "services" && styles.tabTextActive]}>Services</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === "team" && styles.tabBtnActive]} onPress={() => setTab("team")}>
          <Text style={[styles.tabText, tab === "team" && styles.tabTextActive]}>Team</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === "schedules" && styles.tabBtnActive]} onPress={() => setTab("schedules")}>
          <Text style={[styles.tabText, tab === "schedules" && styles.tabTextActive]}>Schedules</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === "transactions" && styles.tabBtnActive]} onPress={() => setTab("transactions")}>
          <Text style={[styles.tabText, tab === "transactions" && styles.tabTextActive]}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === "cancellations" && styles.tabBtnActive]} onPress={() => setTab("cancellations")}>
          <Text style={[styles.tabText, tab === "cancellations" && styles.tabTextActive]}>Cancels</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === "reschedules" && styles.tabBtnActive]} onPress={() => setTab("reschedules")}>
          <Text style={[styles.tabText, tab === "reschedules" && styles.tabTextActive]}>Reschedules</Text>
        </TouchableOpacity>
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {tab === "services" && (
            <>
              <TouchableOpacity style={styles.addBtn} onPress={openAddService}>
                <Ionicons name="add" size={20} color={COLORS.background} />
                <Text style={styles.addBtnText}>Add Service</Text>
              </TouchableOpacity>
              {services.map((s) => (
                <View key={s.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardName}>{s.title}</Text>
                      <Text style={styles.cardSub}>{s.duration} · {s.price}</Text>
                    </View>
                    <TouchableOpacity onPress={() => openEditService(s)} style={styles.iconBtn}>
                      <Ionicons name="pencil" size={18} color={COLORS.subtext} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteService(s)} style={styles.iconBtn}>
                      <Ionicons name="trash" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          {tab === "team" && (
            <>
              <TouchableOpacity style={styles.addBtn} onPress={openAddMember}>
                <Ionicons name="add" size={20} color={COLORS.background} />
                <Text style={styles.addBtnText}>Add Member</Text>
              </TouchableOpacity>
              {team.map((m) => (
                <View key={m.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{m.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardName}>{m.name}</Text>
                      <Text style={styles.cardSub}>{m.role}</Text>
                    </View>
                    <TouchableOpacity onPress={() => openEditMember(m)} style={styles.iconBtn}>
                      <Ionicons name="pencil" size={18} color={COLORS.subtext} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteMember(m)} style={styles.iconBtn}>
                      <Ionicons name="trash" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}
          {tab === "schedules" && (
            <>
              <TouchableOpacity style={styles.addBtn} onPress={openAddSchedule}>
                <Ionicons name="add" size={20} color={COLORS.background} />
                <Text style={styles.addBtnText}>Add Schedule</Text>
              </TouchableOpacity>
              {schedules.map((s) => (
                <View key={s.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardName}>{s.barberId}</Text>
                      <Text style={styles.cardSub}>{s.date}</Text>
                      <Text style={styles.cardSub}>Available: {s.availableSlots?.join(", ") || "none"}</Text>
                      <Text style={styles.cardSub}>Taken: {s.takenSlots?.join(", ") || "none"}</Text>
                    </View>
                    <TouchableOpacity onPress={() => openEditSchedule(s)} style={styles.iconBtn}>
                      <Ionicons name="pencil" size={18} color={COLORS.subtext} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteSchedule(s)} style={styles.iconBtn}>
                      <Ionicons name="trash" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          {tab === "transactions" && (
            <>
              <Text style={[styles.cardName, { marginBottom: 12 }]}>
                Total bookings: {transactions.length}
              </Text>
              {transactions.length === 0 && (
                <Text style={{ color: COLORS.subtext }}>No bookings yet.</Text>
              )}
              {transactions.map((tx) => (
                <View key={tx.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardName}>{tx.service}</Text>
                      <Text style={styles.cardSub}>{tx.barber} · {tx.date} · {tx.time}</Text>
                      <Text style={styles.cardSub}>{tx.price} · {tx.fullName ?? "Client"}</Text>
                      {tx.timezone && <Text style={styles.cardSub}>🕐 {tx.timezone}</Text>}
                      <Text style={[styles.cardSub, { marginTop: 4, color: tx.status === "confirmed" ? "#4caf50" : COLORS.subtext }]}>
                        Status: {tx.status}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => openEditTx(tx)} style={styles.iconBtn}>
                      <Ionicons name="pencil" size={18} color={COLORS.subtext} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          {tab === "cancellations" && (
            <>
              {cancellations.length === 0 && <Text style={{ color: COLORS.subtext, marginTop: 8 }}>No cancellations yet.</Text>}
              {cancellations.map((c) => (
                <View key={c.id} style={styles.card}>
                  <Text style={styles.cardName}>{c.service}</Text>
                  <Text style={styles.cardSub}>Barber: {c.barber}</Text>
                  <Text style={styles.cardSub}>Was: {c.date} at {c.time}</Text>
                  <Text style={styles.cardSub}>Cancelled: {new Date(c.cancelledAt).toLocaleString()}</Text>
                </View>
              ))}
            </>
          )}

          {tab === "reschedules" && (
            <>
              {reschedules.length === 0 && <Text style={{ color: COLORS.subtext, marginTop: 8 }}>No reschedules yet.</Text>}
              {reschedules.map((r) => (
                <View key={r.id} style={styles.card}>
                  <Text style={styles.cardName}>{r.service}</Text>
                  <Text style={styles.cardSub}>Barber: {r.barber}</Text>
                  <Text style={styles.cardSub}>New: {r.newDate} at {r.newTime}</Text>
                  <Text style={styles.cardSub}>Rescheduled: {new Date(r.rescheduledAt).toLocaleString()}</Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}

      {/* Transaction Edit Modal */}
      <Modal visible={showTxModal} transparent animationType="slide" onRequestClose={() => setShowTxModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Booking</Text>
            <TextInput style={styles.input} placeholder="Date" placeholderTextColor={COLORS.subtext} value={txDate} onChangeText={setTxDate} />
            <TextInput style={styles.input} placeholder="Time" placeholderTextColor={COLORS.subtext} value={txTime} onChangeText={setTxTime} />
            <TextInput style={styles.input} placeholder="Barber" placeholderTextColor={COLORS.subtext} value={txBarber} onChangeText={setTxBarber} />
            <TextInput style={styles.input} placeholder="Status (confirmed/cancelled)" placeholderTextColor={COLORS.subtext} value={txStatus} onChangeText={setTxStatus} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowTxModal(false)}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveTx}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Service Modal */}
      <Modal visible={showServiceModal} transparent animationType="slide" onRequestClose={() => setShowServiceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingService ? "Edit Service" : "Add Service"}</Text>
            <TextInput style={styles.input} placeholder="Title" placeholderTextColor={COLORS.subtext} value={sTitle} onChangeText={setSTitle} />
            <TextInput style={styles.input} placeholder="Duration (e.g. 1 hr)" placeholderTextColor={COLORS.subtext} value={sDuration} onChangeText={setSDuration} />
            <TextInput style={styles.input} placeholder="Price (e.g. ₱800)" placeholderTextColor={COLORS.subtext} value={sPrice} onChangeText={setSPrice} />
            <TextInput style={[styles.input, styles.textArea]} placeholder={"Details (one per line)"} placeholderTextColor={COLORS.subtext} value={sDetails} onChangeText={setSDetails} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowServiceModal(false)}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveService} disabled={savingService}>
                {savingService
                  ? <ActivityIndicator color={COLORS.background} size="small" />
                  : <Text style={styles.saveBtnText}>Save</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Schedule Modal */}
      <Modal visible={showScheduleModal} transparent animationType="slide" onRequestClose={() => setShowScheduleModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingSchedule ? "Edit Schedule" : "Add Schedule"}</Text>
            <TextInput style={styles.input} placeholder="Barber name (e.g. Nat Nat)" placeholderTextColor={COLORS.subtext} value={schBarberId} onChangeText={setSchBarberId} />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" placeholderTextColor={COLORS.subtext} value={schDate} onChangeText={setSchDate} />
            <TextInput style={[styles.input, styles.textArea]} placeholder={"Available slots (comma separated)\ne.g. 10:00 AM, 11:00 AM, 2:00 PM"} placeholderTextColor={COLORS.subtext} value={schSlots} onChangeText={setSchSlots} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowScheduleModal(false)}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveSchedule}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Team Modal */}
      <Modal visible={showTeamModal} transparent animationType="slide" onRequestClose={() => setShowTeamModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingMember ? "Edit Member" : "Add Team Member"}</Text>
            <TextInput style={styles.input} placeholder="Name" placeholderTextColor={COLORS.subtext} value={tName} onChangeText={setTName} />
            <TextInput style={styles.input} placeholder="Role (e.g. Barber Artist)" placeholderTextColor={COLORS.subtext} value={tRole} onChangeText={setTRole} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Description" placeholderTextColor={COLORS.subtext} value={tDesc} onChangeText={setTDesc} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowTeamModal(false)}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveMember} disabled={savingMember}>
                {savingMember
                  ? <ActivityIndicator color={COLORS.background} size="small" />
                  : <Text style={styles.saveBtnText}>Save</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.deleteOverlay}>
          <View style={styles.deleteCard}>
            <Text style={styles.deleteTitle}>Delete "{deleteTarget?.name}"?</Text>
            <Text style={styles.deleteBody}>
              This will permanently remove it. This cannot be undone.
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.deleteConfirmText}>Yes, delete</Text>
                }
              </TouchableOpacity>
            </View>
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
  pageTitle: { color: COLORS.text, fontSize: 16, fontWeight: "800" },
  headerTag: { color: COLORS.primary, fontSize: 9, fontWeight: "700", letterSpacing: 3 },
  placeholder: { width: 48 },
  tabs: { flexDirection: "row", paddingHorizontal: 20, paddingRight: 40, paddingVertical: 10, gap: 8 },
  tabBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  tabBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.subtext, fontWeight: "600", fontSize: 12 },
  tabTextActive: { color: COLORS.background, fontWeight: "700", fontSize: 12 },
  content: { padding: 20, paddingBottom: 40 },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 14, marginBottom: 16, alignSelf: "flex-start",
  },
  addBtnText: { color: COLORS.background, fontWeight: "800", fontSize: 13, letterSpacing: 1 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardName: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  cardSub: { color: COLORS.subtext, fontSize: 12, marginTop: 3 },
  iconBtn: { padding: 8 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: COLORS.background, fontSize: 16, fontWeight: "900" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, borderTopWidth: 3, borderTopColor: COLORS.primary,
  },
  modalTitle: { color: COLORS.primary, fontSize: 11, fontWeight: "700", letterSpacing: 3, marginBottom: 16 },
  input: {
    backgroundColor: COLORS.background, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.text, fontSize: 14, marginBottom: 10,
  },
  textArea: { height: 90, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 6 },
  cancelModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: "center" },
  cancelModalText: { color: COLORS.subtext, fontWeight: "600" },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: "center" },
  saveBtnText: { color: COLORS.background, fontWeight: "800" },
  statusBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statusBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusBtnText: { color: COLORS.subtext, fontSize: 12 },
  statusBtnTextActive: { color: COLORS.background, fontWeight: "700" },
  deleteOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  deleteCard: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 24, width: "100%",
  },
  deleteTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700", marginBottom: 10 },
  deleteBody: { color: COLORS.subtext, fontSize: 13, lineHeight: 20, marginBottom: 24 },
  deleteActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  deleteCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  deleteCancelText: { color: COLORS.subtext, fontSize: 14 },
  deleteConfirmBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: COLORS.primary },
  deleteConfirmText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
