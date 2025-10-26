import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { validateUser, initDB } from "../../src/db/database";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize DB when login screen mounts
  useEffect(() => {
    initDB().catch((err) => console.error("DB init failed:", err));
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please fill in both fields.");
      return;
    }

    try {
      setLoading(true);
      const user = await validateUser(email, password);

      if (!user) {
        Alert.alert("Invalid Credentials", "Incorrect email or password.");
        return;
      }

      // Save the logged-in user to AsyncStorage
      await AsyncStorage.setItem("loggedInUser", JSON.stringify(user));

      Alert.alert("Login Successful", `Welcome back, ${user.name}!`);

      // Navigate to home screen
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Error", error.message || "Something went wrong while logging in.");
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
            Welcome Back
          </Text>
          <Text className="text-gray-500 text-center">
            Log in to continue managing your store with Shelfly.
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
        </View>

        <TouchableOpacity
          disabled={loading}
          onPress={handleLogin}
          className={`mt-10 py-4 rounded-2xl ${loading ? "bg-gray-400" : "bg-green-700"}`}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white font-bold text-lg">Log In</Text>
          )}
        </TouchableOpacity>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-600">Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/signup")}>
            <Text className="text-green-700 font-semibold">Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
