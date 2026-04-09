import { router } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
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
  const [error, setError] = useState("");

  const handleAuth = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.replace("/home");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setEmail("");
        setPassword("");
        setIsLogin(true);
        setError("");
      }
    } catch (e: any) {
      const code = e.code as string;
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Incorrect password. Please try again.");
      } else if (code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError(e.message ?? "Something went wrong. Please try again.");
      }
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
          <Text style={{ color: COLORS.text }}>FADE</Text>
        </Text>

        <Text style={styles.subtitle}>Invest In Your Hair.</Text>

        {/* TOGGLE */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.activeTab]}
            onPress={() => { setIsLogin(true); setError(""); }}
          >
            <Text style={isLogin ? styles.activeText : styles.inactiveText}>
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.activeTab]}
            onPress={() => { setIsLogin(false); setError(""); }}
          >
            <Text style={!isLogin ? styles.activeText : styles.inactiveText}>
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* INPUTS */}
        <InputField placeholder="Email" value={email} onChangeText={(v: string) => { setEmail(v); setError(""); }} />
        <InputField
          placeholder="Password"
          secure
          value={password}
          onChangeText={(v: string) => { setPassword(v); setError(""); }}
        />

        {/* ERROR */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
    backgroundColor: COLORS.text,
    borderRadius: 12,
  },
  activeText: {
    color: COLORS.background,
    fontWeight: "bold",
  },
  inactiveText: {
    color: COLORS.subtext,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
});
