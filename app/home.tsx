import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import PageLoader from "../components/ui/PageLoader";
import { auth, db } from "../services/firebase";

const ADMIN_EMAIL = "admin@alldayfade.com";
const GOLD = "#C9A84C";
const DARK = "#0A0A0A";
const CARD = "#111111";
const BORDER = "#222222";

const categories = [
  { label: "Services", sub: "View all services", icon: "cut-outline", route: "/categories/service" },
  { label: "Our Team", sub: "Meet the barbers", icon: "people-outline", route: "/categories/team" },
  { label: "About", sub: "Our story", icon: "information-circle-outline", route: "/categories/about" },
  { label: "Address", sub: "Find us", icon: "location-outline", route: "/categories/address" },
] as const;

const navItems = [
  { label: "Home", route: "/home", icon: "home" as const, iconActive: "home" as const },
  { label: "Profile", route: "/profile", icon: "person-outline" as const, iconActive: "person" as const },
] as const;

export default function Home() {
  const isAdmin = auth.currentUser?.email === ADMIN_EMAIL;
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState("");
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { setPageReady(true); return; }
    if (isAdmin) { setDisplayName("Admin"); setPageReady(true); return; }
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists() && snap.data().fullName) {
        setDisplayName(snap.data().fullName.split(" ")[0]);
      } else {
        setDisplayName(user.email?.split("@")[0] ?? "");
      }
    }).catch(() => setDisplayName(user.email?.split("@")[0] ?? ""))
      .finally(() => setPageReady(true));
  }, []);

  if (!pageReady) return <PageLoader />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandSmall}>WELCOME TO</Text>
            <Text style={styles.brand}>ALLDAYFADE</Text>
          </View>
          {isAdmin ? (
            <TouchableOpacity style={styles.adminBadge} onPress={() => router.push("/admin" as any)}>
              <Ionicons name="settings-outline" size={14} color={GOLD} />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </TouchableOpacity>
          ) : displayName ? (
            <View style={styles.greetingBadge}>
              <Text style={styles.greetingText}>{displayName}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Hero banner ── */}
        <View style={styles.heroBanner}>
          <Image
            source={{ uri: "https://img.freepik.com/premium-vector/adf-creative-abstract-alphabet-modern-minimal-letter-initial-business-symbol-icon-vector-logo_1237311-3286.jpg" }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTag}>PREMIUM BARBERSHOP</Text>
            <Text style={styles.heroTitle}>Sharp Cuts.{"\n"}Clean Fades.</Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.push("/categories/service")}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={14} color={DARK} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Tagline ── */}
        <Text style={styles.tagline}>A well-groomed man is a confident man.</Text>

        {/* ── Section title ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.goldLine} />
          <Text style={styles.sectionTitle}>EXPLORE</Text>
          <View style={styles.goldLine} />
        </View>

        {/* ── Category grid ── */}
        <View style={styles.grid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={styles.gridCard}
              onPress={() => router.push(cat.route)}
              activeOpacity={0.8}
            >
              <View style={styles.gridIconWrapper}>
                <Ionicons name={cat.icon as any} size={26} color={GOLD} />
              </View>
              <Text style={styles.gridLabel}>{cat.label}</Text>
              <Text style={styles.gridSub}>{cat.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Footer quote ── */}
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>"Your style. Your identity."</Text>
          <Text style={styles.quoteBrand}>— AllDayFade</Text>
        </View>

      </ScrollView>

      {/* ── Navbar ── */}
      <View style={styles.navbar}>
        {navItems.map((item) => {
          const active = pathname === item.route;
          return (
            <TouchableOpacity
              key={item.label}
              style={styles.navItem}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={active ? item.iconActive : item.icon}
                size={24}
                color={active ? GOLD : "#555"}
              />
              <Text style={[styles.navText, active && styles.navTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK },
  content: { paddingBottom: 100 },

  // Header
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16,
  },
  brandSmall: { color: GOLD, fontSize: 10, fontWeight: "700", letterSpacing: 4 },
  brand: { color: "#fff", fontSize: 26, fontWeight: "900", letterSpacing: 3 },
  adminBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: GOLD,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  adminBadgeText: { color: GOLD, fontSize: 12, fontWeight: "700" },
  greetingBadge: {
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  greetingText: { color: "#888", fontSize: 12, fontWeight: "600" },

  // Hero
  heroBanner: {
    marginHorizontal: 24, borderRadius: 20, overflow: "hidden",
    height: 220, marginBottom: 20,
  },
  heroImage: { width: "100%", height: "100%", position: "absolute" },
  heroOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    padding: 24, justifyContent: "flex-end",
  },
  heroTag: { color: GOLD, fontSize: 10, fontWeight: "700", letterSpacing: 3, marginBottom: 6 },
  heroTitle: { color: "#fff", fontSize: 26, fontWeight: "900", lineHeight: 32, marginBottom: 16 },
  heroBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: GOLD, paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 30, alignSelf: "flex-start",
  },
  heroBtnText: { color: DARK, fontSize: 13, fontWeight: "800" },

  // Tagline
  tagline: {
    color: "#555", fontSize: 13, textAlign: "center",
    fontStyle: "italic", marginBottom: 28, paddingHorizontal: 24,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 24, marginBottom: 16, gap: 12,
  },
  goldLine: { flex: 1, height: 1, backgroundColor: BORDER },
  sectionTitle: { color: GOLD, fontSize: 11, fontWeight: "800", letterSpacing: 4 },

  // Grid
  grid: {
    flexDirection: "row", flexWrap: "wrap",
    paddingHorizontal: 16, gap: 12, marginBottom: 28,
  },
  gridCard: {
    width: "47%", backgroundColor: CARD,
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: BORDER,
  },
  gridIconWrapper: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "#1a1a1a", justifyContent: "center",
    alignItems: "center", marginBottom: 12,
    borderWidth: 1, borderColor: "#2a2a2a",
  },
  gridLabel: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 4 },
  gridSub: { color: "#555", fontSize: 11 },

  // Quote
  quoteBox: {
    marginHorizontal: 24, padding: 24,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: BORDER,
    alignItems: "center", marginBottom: 8,
  },
  quoteText: { color: "#666", fontSize: 15, fontStyle: "italic", textAlign: "center" },
  quoteBrand: { color: GOLD, fontSize: 12, fontWeight: "700", marginTop: 8, letterSpacing: 2 },

  // Navbar
  navbar: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    height: 72, backgroundColor: "#0d0d0d",
    borderTopWidth: 1, borderTopColor: BORDER,
    flexDirection: "row", justifyContent: "space-around",
    alignItems: "center", paddingBottom: 8,
  },
  navItem: { alignItems: "center", justifyContent: "center", flex: 1, paddingVertical: 6 },
  navText: { color: "#555", fontSize: 10, marginTop: 3, fontWeight: "600" },
  navTextActive: { color: GOLD },
});
