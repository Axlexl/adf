import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
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
import { db } from "../../services/firebase";

type Member = { id: string; name: string; role: string; description: string };

const DEFAULT_TEAM: Omit<Member, "id">[] = [
  { name: "Nat Nat", role: "Barber Artist", description: "Catch me up at ADF MAIN, ALT building Vinzon Street Obrero Davao City" },
  { name: "Kharel Patentis", role: "Senior Barber", description: "I am located at NEW MAIN ADF located ALT Building Vinzon Street Obrero Davao City" },
  { name: "Elmar", role: "Barber Artist", description: "ALLDAYFADE main alt bldg. vinzon obrero davao city" },
  { name: "Barber Jm", role: "Barber Artist", description: "Visit me at ALLDAYFADE for the freshest fades and styling." },
  { name: "Carl", role: "Barber Artist", description: "Find me at ALLDAYFADE on Vinzon Street for a sharp new look." },
  { name: "Jake", role: "Barber Artist", description: "Stop by ALLDAYFADE for expert cuts and fade styles." },
];

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);
  const pageReady = usePageLoader(500);

  useEffect(() => {
    return onSnapshot(collection(db, "team"), (snap) => {
      if (snap.empty) {
        DEFAULT_TEAM.forEach((m) =>
          addDoc(collection(db, "team"), m).catch(() => {})
        );
        setTeamMembers(DEFAULT_TEAM.map((m, i) => ({ id: String(i), ...m })));
      } else {
        setTeamMembers(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<Member, "id">) }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      }
    });
  }, []);

  if (!pageReady) return <PageLoader />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/home")}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Team</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heroTag}>MEET THE ARTISTS</Text>
        <Text style={styles.heroTitle}>Our{"\n"}Barbers</Text>
        <View style={styles.goldLine} />

        {teamMembers.map((member) => (
          <View key={member.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{member.name}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.cardRole}>{member.role}</Text>
                </View>
              </View>
            </View>
            <View style={styles.descRow}>
              <View style={styles.descLine} />
              <Text style={styles.cardDescription}>{member.description}</Text>
            </View>
          </View>
        ))}
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
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  heroTag: { color: COLORS.primary, fontSize: 11, fontWeight: "700", letterSpacing: 4, marginBottom: 8 },
  heroTitle: { color: COLORS.text, fontSize: 34, fontWeight: "900", lineHeight: 40, marginBottom: 16 },
  goldLine: { width: 50, height: 2, backgroundColor: COLORS.primary, borderRadius: 2, marginBottom: 24 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.primary, justifyContent: "center",
    alignItems: "center", marginRight: 14,
  },
  avatarText: { color: COLORS.background, fontSize: 20, fontWeight: "900" },
  cardInfo: { flex: 1 },
  cardName: { color: COLORS.text, fontSize: 16, fontWeight: "700", marginBottom: 6 },
  roleBadge: {
    alignSelf: "flex-start", backgroundColor: "#1e1a0e",
    borderWidth: 1, borderColor: COLORS.primary,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  cardRole: { color: COLORS.primary, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  descRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  descLine: { width: 2, borderRadius: 2, backgroundColor: COLORS.primary, alignSelf: "stretch" },
  cardDescription: { color: COLORS.subtext, fontSize: 13, lineHeight: 20, flex: 1 },
});
