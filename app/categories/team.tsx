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
import { COLORS } from "../../constants/colors";
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/home")}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Team</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {teamMembers.map((member) => (
          <View key={member.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
              </View>
              <View style={styles.cardTitle}>
                <Text style={styles.cardName}>{member.name}</Text>
                <Text style={styles.cardRole}>{member.role}</Text>
              </View>
            </View>
            <Text style={styles.cardDescription}>{member.description}</Text>
          </View>
        ))}
      </ScrollView>
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
  backButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.card, justifyContent: "center", alignItems: "center" },
  pageTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 48,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  cardTitle: {
    flex: 1,
  },
  cardName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  cardRole: {
    color: COLORS.subtext,
    marginTop: 2,
  },
  cardDescription: {
    color: COLORS.subtext,
    lineHeight: 20,
  },
});
