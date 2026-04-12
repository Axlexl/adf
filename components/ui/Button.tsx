import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/colors";

export default function Button({ title, onPress }: any) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  text: {
    color: COLORS.background,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
