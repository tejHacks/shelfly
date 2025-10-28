import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { deleteUser, updateUser, User } from "../../src/db/database";

export default function Settings() {
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load user from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const storedUser = await AsyncStorage.getItem("loggedInUser");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setName(parsed.name);
        setEmail(parsed.email);
      }
    })();
  }, []);

  // Update name and persist to DB + AsyncStorage
  const handleUpdateInfo = async () => {
    if (!user) return Alert.alert("Error", "No user found");

    setLoading(true);
    try {
      await updateUser({ email: user.email, name });
      const updatedUser = { ...user, name };
      await AsyncStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      Alert.alert("Success", "User info updated successfully");
    } catch (err: any) {
      console.error("Update info failed:", err);
      Alert.alert("Error", err.message || "Failed to update user info");
    } finally {
      setLoading(false);
    }
  };

  // Change password and clear input
  const handleChangePassword = async () => {
    if (!user) return Alert.alert("Error", "No user found");
    if (!password.trim()) return Alert.alert("Error", "Password cannot be empty");

    setLoading(true);
    try {
      await updateUser({ email: user.email, password });
      Alert.alert("Success", "Password changed successfully");
      setPassword(""); // Clear password field
    } catch (err: any) {
      console.error("Password change failed:", err);
      Alert.alert("Error", err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Logout and redirect
  const handleLogout = async () => {
    await AsyncStorage.removeItem("loggedInUser");
    router.replace("/(auth)/login");
  };

  // Delete account with confirmation
  const handleDeleteAccount = async () => {
    if (!user) return Alert.alert("Error", "No user found");

    Alert.alert(
      "Delete Account",
      "This action is PERMANENT. All your products will be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "DELETE",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteUser(user.email);
              await AsyncStorage.removeItem("loggedInUser");
              Alert.alert("Deleted", "Your account has been removed.");
              router.replace("/(auth)/login");
            } catch (err: any) {
              console.error("Account deletion failed:", err);
              Alert.alert("Error", err.message || "Failed to delete account");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-extrabold text-green-700 mt-6 mb-4">
          Settings
        </Text>

        {/* Global loading overlay */}
        {loading ? (
          <View className="flex-1 items-center justify-center mt-20">
            <ActivityIndicator size="large" color="#047857" />
            <Text className="text-gray-500 mt-3">Processing...</Text>
          </View>
        ) : (
          <>
            {/* Profile Info Section */}
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Profile Info
            </Text>
            <View className="mb-4">
              <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                className="border border-gray-300 rounded-xl p-3 mb-3"
                editable={!loading}
              />
              <TextInput
                placeholder="Email"
                value={email}
                editable={false}
                className="border border-gray-300 rounded-xl p-3 bg-gray-100"
              />
            </View>

            <TouchableOpacity
              onPress={handleUpdateInfo}
              disabled={loading}
              className={`py-4 rounded-2xl mb-8 ${
                loading ? "bg-green-400" : "bg-green-700"
              }`}
            >
              <Text className="text-white text-center font-bold text-lg">
                {loading ? "Updating..." : "Update Info"}
              </Text>
            </TouchableOpacity>

            {/* Change Password Section */}
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Change Password
            </Text>
            <View className="mb-4">
              <TextInput
                placeholder="New Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="border border-gray-300 rounded-xl p-3"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={loading}
              className={`py-4 rounded-2xl mb-8 ${
                loading ? "bg-yellow-300" : "bg-yellow-500"
              }`}
            >
              <Text className="text-white text-center font-bold text-lg">
                {loading ? "Changing..." : "Change Password"}
              </Text>
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              disabled={loading}
              className="bg-red-600 py-4 rounded-2xl mb-10"
            >
              <Text className="text-white text-center font-bold text-lg">
                Logout
              </Text>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              disabled={loading}
              className={`py-4 rounded-2xl mb-12 ${
                loading ? "bg-gray-500" : "bg-gray-800"
              }`}
            >
              <Text className="text-white text-center font-bold text-lg">
                {loading ? "Deleting..." : "Delete Account"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}