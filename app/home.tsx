import { router } from "expo-router";
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

const categories = [
  { label: "SERVICE", route: "/categories/service" },
  { label: "TEAM", route: "/categories/team" },
  { label: "ABOUT", route: "/categories/about" },
  { label: "ADDRESS", route: "/categories/address" },
] as const;

const navItems = [
  { label: "Home", route: "/home" },
  { label: "Profile", route: "/profile" },
] as const;

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>ALLDAYFADE</Text>
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
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.navItem}
            onPress={() => router.push(item.route)}
          >
            <Text style={styles.navText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
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
  },
  navText: {
    color: COLORS.subtext,
    fontSize: 12,
  },
});
