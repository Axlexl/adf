import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";
import { auth } from "../services/firebase";

const ADMIN_EMAIL = "admin@alldayfade.com";

const categories = [
  { label: "SERVICE", route: "/categories/service" },
  { label: "TEAM", route: "/categories/team" },
  { label: "ABOUT", route: "/categories/about" },
  { label: "ADDRESS", route: "/categories/address" },
] as const;

const navItems = [
  { label: "Home", route: "/home", icon: "home" as const, iconActive: "home" as const },
  { label: "Profile", route: "/profile", icon: "person-outline" as const, iconActive: "person" as const },
] as const;

export default function Home() {
  const isAdmin = auth.currentUser?.email === ADMIN_EMAIL;
  const pathname = usePathname();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>ALLDAYFADE</Text>
          {isAdmin && (
            <TouchableOpacity style={styles.adminBtn} onPress={() => router.push("/admin" as any)}>
              <Text style={styles.adminBtnText}>Admin</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.subtitle}>
          A well-groomed man is a confident man.
        </Text>

        <Text style={styles.sectionTitle}>Categories</Text>

        <View style={styles.categories}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.label}
              style={styles.categoryCard}
              onPress={() => router.push(category.route)}
            >
              <Text style={styles.categoryText}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: "https://img.freepik.com/premium-vector/adf-creative-abstract-alphabet-modern-minimal-letter-initial-business-symbol-icon-vector-logo_1237311-3286.jpg",
            }}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>
      </ScrollView>

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
                size={26}
                color={active ? COLORS.text : COLORS.subtext}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 110,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "bold",
  },
  adminBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  adminBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    color: COLORS.text,
    fontSize: 18,
  },
  subtitle: {
    color: COLORS.subtext,
    fontSize: 16,
    marginBottom: 20,
  },
  searchBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchInput: {
    height: 48,
    color: COLORS.text,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  categoryText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  itemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    overflow: "hidden",
  },
  itemImagePlaceholder: {
    height: 180,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  itemImageText: {
    color: COLORS.subtext,
  },
  itemInfo: {
    padding: 16,
  },
  itemTag: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginBottom: 6,
  },
  itemTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  itemPrice: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  logoContainer: {
    width: "100%",
    height: 180,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: COLORS.border,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  navbar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 8,
  },
  navText: {
    color: COLORS.subtext,
    fontSize: 11,
    marginTop: 3,
  },
  navTextActive: {
    color: COLORS.text,
    fontWeight: "600",
  },
});
