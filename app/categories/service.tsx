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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/home")}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Services</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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
                <View>
                  <Text style={styles.cardTitle}>{service.title}</Text>
                  <Text style={styles.cardSubtitle}>
                    {service.duration} · {service.price}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => setExpandedIndex(expanded ? null : index)}
                >
                  <Text style={styles.detailsButtonText}>
                    {expanded ? "Hide details" : "Details"}
                  </Text>
                </TouchableOpacity>
              </View>

              {expanded && service.details.length > 0 && (
                <View style={styles.detailsContainer}>
                  {service.details.map((line) => (
                    <Text key={line} style={styles.detailText}>
                      {line}
                    </Text>
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
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 48,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 280,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardSubtitle: {
    color: COLORS.subtext,
    fontSize: 14,
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailsButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },
  detailsContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
  },
  detailText: {
    color: COLORS.subtext,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  summaryServiceName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  summaryDuration: {
    color: COLORS.subtext,
    fontSize: 13,
    marginTop: 2,
  },
  summaryPrice: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  totalLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  totalPrice: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  summaryPlaceholder: {
    color: COLORS.subtext,
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
