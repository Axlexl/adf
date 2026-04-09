import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert, SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS } from "../../constants/colors";

const barbers = [
  { name: "Nat Nat", role: "Barber Artist" },
  { name: "Kharel Patentis", role: "Senior Barber" },
  { name: "Elmar", role: "Barber Artist" },
  { name: "Barber Jm", role: "Barber Artist" },
  { name: "Carl", role: "Barber Artist" },
  { name: "Jake", role: "Barber Artist" },
];

export default function SelectBarber() {
  const { service, price, duration } = useLocalSearchParams<{
    service: string;
    price: string;
    duration: string;
  }>();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  function handleBook() {
    if (selectedIndex === null) {
      Alert.alert("Select a barber", "Please choose a barber before booking.");
      return;
    }

    const barber = barbers[selectedIndex];
    router.push({
      pathname: "/categories/booking",
      params: { service, price, duration, barber: barber.name },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Select Barber</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {barbers.map((barber, index) => {
          const selected = selectedIndex === index;
          return (
            <TouchableOpacity
              key={barber.name}
              style={[styles.barberCard, selected && styles.barberCardSelected]}
              activeOpacity={0.9}
              onPress={() => setSelectedIndex(index)}
            >
              <View style={styles.barberAvatar}>
                <Text style={styles.avatarText}>{barber.name.charAt(0)}</Text>
              </View>
              <View style={styles.barberInfo}>
                <Text style={styles.barberName}>{barber.name}</Text>
                <Text style={styles.barberRole}>{barber.role}</Text>
              </View>
              <Text style={styles.selectText}>
                {selected ? "Selected" : "Choose"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryServiceName}>{service || "—"}</Text>
              <Text style={styles.summaryDuration}>{duration}</Text>
            </View>
            <Text style={styles.summaryPrice}>{price}</Text>
          </View>

          {selectedIndex !== null && (
            <>
              <View style={styles.summaryRow} >
                <View>
                  <Text style={styles.summaryServiceName}>{barbers[selectedIndex].name}</Text>
                  <Text style={styles.summaryDuration}>{barbers[selectedIndex].role}</Text>
                </View>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total to pay</Text>
            <Text style={styles.totalPrice}>{price}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            selectedIndex === null && styles.bookButtonDisabled,
          ]}
          activeOpacity={0.9}
          onPress={handleBook}
        >
          <Text style={styles.bookButtonText}>Book</Text>
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
    paddingBottom: 320,
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
    marginBottom: 8,
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
    marginVertical: 10,
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
  barberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  barberCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  barberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  barberInfo: {
    flex: 1,
  },
  barberName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  barberRole: {
    color: COLORS.subtext,
    fontSize: 14,
    marginTop: 4,
  },
  selectText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  bookButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
