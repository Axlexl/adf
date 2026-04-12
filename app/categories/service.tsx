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

type Service = { id: string; title: string; duration: string; price: string; details: string[] };

const DEFAULT_SERVICES: Omit<Service, "id">[] = [
  { title: "HAIR COLOR", duration: "1 hr", price: "₱800", details: ["BASIC COLORS BLACK BROWN", "WITH HAIRCUT"] },
  { title: "HAIR PERM", duration: "3 hrs", price: "₱2,500", details: ["Hair cut", "Perm", "Complimentary Wash"] },
  { title: "BEARD TRIM", duration: "30 mins", price: "₱100", details: ["Tapering facial hair to maintain a neat look"] },
  { title: "GUCCI", duration: "45 mins", price: "₱300", details: ["HAIRCUT & SHAMPOO WITH SLICK GROOM FINISH!"] },
  { title: "LONG TO SHORT", duration: "1 hr", price: "₱400", details: ["WOLF CUT, MOD CUTS etc.", "The service has Groom and Shampoo"] },
  { title: "BAPE", duration: "45 mins", price: "₱250", details: ["Haircut fades.", "clean trims etc", "Basic groom"] },
  { title: "House Call & Wedding Calls", duration: "3 hrs", price: "₱1,500", details: ["Home service and special event bookings."] },
];

export default function Service() {
  const [services, setServices] = useState<Service[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    return onSnapshot(collection(db, "services"), (snap) => {
      if (snap.empty) {
        // Seed defaults into Firestore so admin can manage them
        DEFAULT_SERVICES.forEach((s) =>
          addDoc(collection(db, "services"), s).catch(() => {})
        );
        // Show defaults immediately while seeding
        setServices(DEFAULT_SERVICES.map((s, i) => ({ id: String(i), ...s })));
      } else {
        setServices(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<Service, "id">) }))
            .sort((a, b) => a.title.localeCompare(b.title))
        );
      }
    });
  }, []);

  function handleSelectService(service: Service) {
    setSelectedService(service);
  }

  function handleContinue() {
    if (!selectedService) return;
    router.push({
      pathname: "/categories/select-barber",
      params: {
        service: selectedService.title,
        price: selectedService.price,
        duration: selectedService.duration,
      },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/home")}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Services</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heroTag}>WHAT WE OFFER</Text>
        <Text style={styles.heroTitle}>Our{"\n"}Services</Text>
        <View style={styles.goldLine} />

        {services.map((service, index) => {
          const expanded = expandedIndex === index;
          const isSelected = selectedService?.title === service.title;
          return (
            <TouchableOpacity
              key={service.title}
              style={[styles.card, isSelected && styles.cardSelected]}
              activeOpacity={0.9}
              onPress={() => handleSelectService(service)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardLeft}>
                  {isSelected && <View style={styles.selectedDot} />}
                  <View>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>{service.title}</Text>
                    <Text style={styles.cardSubtitle}>{service.duration} · <Text style={styles.priceText}>{service.price}</Text></Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.detailsButton, isSelected && styles.detailsButtonSelected]}
                  onPress={() => setExpandedIndex(expanded ? null : index)}
                >
                  <Text style={[styles.detailsButtonText, isSelected && styles.detailsButtonTextSelected]}>
                    {expanded ? "Hide" : "Details"}
                  </Text>
                </TouchableOpacity>
              </View>

              {expanded && service.details.length > 0 && (
                <View style={styles.detailsContainer}>
                  {service.details.map((line) => (
                    <View key={line} style={styles.detailRow}>
                      <View style={styles.detailBullet} />
                      <Text style={styles.detailText}>{line}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Summary Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          {selectedService ? (
            <>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryServiceName}>{selectedService.title}</Text>
                  <Text style={styles.summaryDuration}>{selectedService.duration}</Text>
                </View>
                <Text style={styles.summaryPrice}>{selectedService.price}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total to pay</Text>
                <Text style={styles.totalPrice}>{selectedService.price}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.summaryPlaceholder}>No service selected yet</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.continueButton, !selectedService && styles.continueButtonDisabled]}
          activeOpacity={0.9}
          onPress={handleContinue}
          disabled={!selectedService}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          {selectedService && <Ionicons name="arrow-forward" size={16} color={COLORS.background} />}
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
  content: { paddingHorizontal: 20, paddingBottom: 280 },
  heroTag: { color: COLORS.primary, fontSize: 11, fontWeight: "700", letterSpacing: 4, marginBottom: 8 },
  heroTitle: { color: COLORS.text, fontSize: 34, fontWeight: "900", lineHeight: 40, marginBottom: 16 },
  goldLine: { width: 50, height: 2, backgroundColor: COLORS.primary, borderRadius: 2, marginBottom: 24 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardSelected: { borderColor: COLORS.primary, borderWidth: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  selectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  cardTitle: { color: COLORS.text, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  cardTitleSelected: { color: COLORS.primary },
  cardSubtitle: { color: COLORS.subtext, fontSize: 13 },
  priceText: { color: COLORS.primary, fontWeight: "700" },
  detailsButton: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  detailsButtonSelected: { borderColor: COLORS.primary },
  detailsButtonText: { color: COLORS.subtext, fontSize: 12, fontWeight: "600" },
  detailsButtonTextSelected: { color: COLORS.primary },
  detailsContainer: { marginTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 14 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  detailBullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 7 },
  detailText: { color: COLORS.subtext, fontSize: 13, lineHeight: 20, flex: 1 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 20, backgroundColor: COLORS.background },
  summaryCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  summaryTitle: { color: COLORS.primary, fontSize: 11, fontWeight: "700", letterSpacing: 3, marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  summaryServiceName: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
  summaryDuration: { color: COLORS.subtext, fontSize: 13, marginTop: 2 },
  summaryPrice: { color: COLORS.primary, fontSize: 15, fontWeight: "700" },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalLabel: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  totalPrice: { color: COLORS.primary, fontSize: 15, fontWeight: "700" },
  summaryPlaceholder: { color: COLORS.subtext, fontSize: 13 },
  continueButton: {
    backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16,
    alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8,
  },
  continueButtonDisabled: { backgroundColor: COLORS.border },
  continueButtonText: { color: COLORS.background, fontSize: 15, fontWeight: "800", letterSpacing: 1 },
});
