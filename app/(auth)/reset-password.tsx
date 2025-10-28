// src/app/(auth)/reset-password.tsx
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { sendResetToken, verifyResetToken, updateUser } from "../../src/db/database";
import { useAuth } from "../../src/context/AuthContext";

export default function ResetPassword() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);

  const handleSendToken = async () => {
    if (!email) {
      Alert.alert("Missing Email", "Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      const code = await sendResetToken(email);
      Alert.alert("Code Sent", `Your reset code: ${code}\nValid for 2 minutes.`);
      setStep("verify");
    } catch (error: any) {
      Alert.alert("Error", error.message || "No account found.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!token || !newPassword) {
      Alert.alert("Missing Fields", "Enter code and new password.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Weak Password", "Password must be 6+ characters.");
      return;
    }

    try {
      setLoading(true);
      const user = await verifyResetToken(email, token);
      if (!user) {
        Alert.alert("Invalid Code", "Code is wrong or expired.");
        return;
      }

      await updateUser({ email, password: newPassword });
      Alert.alert("Success", "Password updated! Please log in.");
      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View className="mb-10">
          <Text className="text-4xl font-extrabold text-green-700 text-center mb-2">
            Reset Password
          </Text>
          <Text className="text-gray-500 text-center">
            {step === "request"
              ? "Enter your email to get a reset code."
              : "Enter the code and new password."}
          </Text>
        </View>

        <View className="space-y-5">
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={step === "request"}
            className="border border-gray-300 rounded-2xl px-4 mb-3 py-3 text-gray-800"
          />

          {step === "verify" && (
            <>
              <TextInput
                placeholder="6-digit code"
                placeholderTextColor="#9CA3AF"
                value={token}
                onChangeText={setToken}
                keyboardType="numeric"
                maxLength={6}
                className="border border-gray-300 rounded-2xl mb-3 px-4 py-3 text-gray-800"
              />
              <TextInput
                placeholder="New Password"
                placeholderTextColor="#9CA3AF"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                className="border border-gray-300 rounded-2xl mb-3 px-4 py-3 text-gray-800"
              />
            </>
          )}
        </View>

        <TouchableOpacity
          disabled={loading || authLoading}
          onPress={step === "request" ? handleSendToken : handleReset}
          className={`mt-10 py-4 rounded-2xl ${loading ? "bg-gray-400" : "bg-green-700"}`}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white font-bold text-lg">
              {step === "request" ? "Send Code" : "Reset Password"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          className="mt-4"
        >
          <Text className="text-center text-green-700 font-semibold">
            Back to Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}