import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { createUser, getUserByEmail, initDB } from "../../src/db/database";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initDB().catch((err) => console.error("DB init failed:", err));
  }, []);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Invalid Email Format", "Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Your passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        Alert.alert("Email Exists", "This email is already registered. Please log in instead.");
        return;
      }

      await createUser({ name, email, password });
      Alert.alert("Signup Successful", `Welcome to Shelfly, ${name}!`);
      router.replace("/(auth)/login"); // fixed TS error
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert("Error", error.message || "Something went wrong while signing up.");
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
            Create Account
          </Text>
          <Text className="text-gray-500 text-center">
            Join Shelfly and start managing your store smarter.
          </Text>
        </View>

        <View className="space-y-7">
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            className="border border-gray-300 rounded-2xl px-4 py-3 mb-2 text-gray-800"
          />
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-gray-300 rounded-2xl px-4 py-3 mb-2 text-gray-800"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="border border-gray-300 rounded-2xl px-4 py-3 mb-2 text-gray-800"
          />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            className="border border-gray-300 rounded-2xl px-4 py-3 mb-2 text-gray-800"
          />
        </View>

        <TouchableOpacity
          disabled={loading}
          onPress={handleSignup}
          className={`mt-10 py-4 rounded-2xl ${loading ? "bg-gray-400" : "bg-green-700"}`}
          activeOpacity={0.8}
        >
          <Text className="text-center text-white font-bold text-lg">
            {loading ? "Creating Account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-600">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text className="text-green-700 font-semibold">Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
