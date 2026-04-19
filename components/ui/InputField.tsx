import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    StyleSheet,
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
        <TouchableOpacity onPress={() => setHide(!hide)} style={styles.eyeBtn}>
          <Ionicons
            name={hide ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={COLORS.subtext}
          />
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
  eyeBtn: {
    padding: 4,
  },
});
