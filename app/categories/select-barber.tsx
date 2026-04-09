import { router } from "expo-router";
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

type Props = {
  searchParams: {
    service?: string;
    price?: string;
    duration?: string;
  };
};

export default function SelectBarber({ searchParams }: Props) {
  const { service, price, duration } = searchParams;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  function handleBook() {
    if (selectedIndex === null) {
      Alert.alert("Select a barber", "Please choose a barber before booking.");
      return;
    }

    const barber = barbers[selectedIndex];
    Alert.alert(
      "Booking Confirmed",
      `You selected ${service} with ${barber.name}.`,
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>B</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Select Barber</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {service || "Selected Service"}
          </Text>
          <Text style={styles.summarySubtitle}>
            {duration} · {price}
          </Text>
        </View>

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
    paddingBottom: 120,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  summarySubtitle: {
    color: COLORS.subtext,
    fontSize: 14,
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
