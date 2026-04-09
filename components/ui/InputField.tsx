import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../../constants/colors";

export default function InputField({
  placeholder,
  secure = false,
  value,
  onChangeText,
}: any) {
  const [hide, setHide] = useState(secure);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.subtext}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={hide}
        style={styles.input}
      />
      {secure && (
        <TouchableOpacity onPress={() => setHide(!hide)}>
          <Text style={styles.toggle}>{hide ? "Show" : "Hide"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: COLORS.text,
  },
  toggle: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});
