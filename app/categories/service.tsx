import { router } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/colors";

const services = [
  {
    title: "HAIR COLOR",
    duration: "1 hr",
    price: "₱800",
    details: ["BASIC COLORS BLACK BROWN", "WITH HAIRCUT"],
  },
  {
    title: "HAIR PERM",
    duration: "3 hrs",
    price: "₱2,500",
    details: ["Hair cut", "Perm", "Complimentary Wash"],
  },
  {
    title: "BEARD TRIM",
    duration: "30 mins",
    price: "₱100",
    details: ["Tapering facial hair to maintain a neat look"],
  },
  {
    title: "GUCCI",
    duration: "45 mins",
    price: "₱300",
    details: ["HAIRCUT & SHAMPOO WITH SLICK GROOM FINISH!"],
  },
  {
    title: "LONG TO SHORT",
    duration: "1 hr",
    price: "₱400",
    details: [
      "This consist",
      "WOLF CUT, MOD CUTS etc. that has long process precise cuts",
      "The service has Groom and Shampoo",
    ],
  },
  {
    title: "BAPE",
    duration: "45 mins",
    price: "₱250",
    details: ["Haircut fades.", "clean trims etc", "Basic groom"],
  },
  {
    title: "House Call & Wedding Calls",
    duration: "3 hrs",
    price: "₱1,500",
    details: ["Home service and special event bookings."],
  },
];

export default function Service() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  function handleSelectService(service: (typeof services)[number]) {
    router.push({
      pathname: "/categories/select-barber",
      params: {
        service: service.title,
        price: service.price,
        duration: service.duration,
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
          <Text style={styles.backText}>B</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Services</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {services.map((service, index) => {
          const expanded = expandedIndex === index;
          return (
            <TouchableOpacity
              key={service.title}
              style={styles.card}
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
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
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
});
