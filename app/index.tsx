import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import { COLORS } from "../constants/colors";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../services/firebase";

export default function Index() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async () => {
    try {
      if (isLogin) {
        // LOGIN
        await signInWithEmailAndPassword(auth, email, password);
        router.replace("/home");
      } else {
        // REGISTER
        await createUserWithEmailAndPassword(auth, email, password);

        Alert.alert("Success", "Account created! Please log in.");

        // CLEAR INPUTS
        setEmail("");
        setPassword("");

        // SWITCH TO LOGIN TAB
        setIsLogin(true);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* TITLE */}
        <Text style={styles.title}>
          <Text style={{ color: COLORS.text }}>ALLDAY</Text>
          <Text style={{ color: COLORS.primary }}>FADE</Text>
        </Text>

        <Text style={styles.subtitle}>Invest In Your Hair. </Text>

        {/* TOGGLE */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.activeTab]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={isLogin ? styles.activeText : styles.inactiveText}>
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.activeTab]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={!isLogin ? styles.activeText : styles.inactiveText}>
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* INPUTS */}
        <InputField placeholder="Email" value={email} onChangeText={setEmail} />
        <InputField
          placeholder="Password"
          secure
          value={password}
          onChangeText={setPassword}
        />

        {/* BUTTON */}
        <Button title={isLogin ? "Sign In" : "Register"} onPress={handleAuth} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: COLORS.subtext,
    marginBottom: 30,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 14,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  inactiveText: {
    color: COLORS.subtext,
  },
});
