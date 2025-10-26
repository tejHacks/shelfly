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
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const handleUpdateInfo = async () => {
    if (!user) return Alert.alert("Error", "No user found");
    try {
      await updateUser({ email: user.email, name });
      const updatedUser = { ...user, name };
      await AsyncStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      Alert.alert("Success", "User info updated successfully");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update user info");
    }
  };

  const handleChangePassword = async () => {
    if (!user) return Alert.alert("Error", "No user found");
    if (!password.trim()) return Alert.alert("Error", "Password cannot be empty");

    try {
      await updateUser({ email: user.email, password });
      Alert.alert("Success", "Password changed successfully");
      setPassword("");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to change password");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("loggedInUser");
    router.replace("/(auth)/login");
  };

  const handleDeleteAccount = async () => {
    if (!user) return Alert.alert("Error", "No user found");

    Alert.alert(
      "Confirm Delete",
      "This will permanently delete your account and all your products. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteUser(user.email);
              await AsyncStorage.removeItem("loggedInUser");
              setLoading(false);
              router.replace("/(auth)/login");
            } catch (err) {
              console.error(err);
              setLoading(false);
              Alert.alert("Error", "Failed to delete account");
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

        {loading ? (
          <View className="flex-1 items-center justify-center mt-20">
            <ActivityIndicator size="large" color="#047857" />
            <Text className="text-gray-500 mt-3">Processing...</Text>
          </View>
        ) : (
          <>
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Profile Info
            </Text>
            <View className="mb-4">
              <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                className="border border-gray-300 rounded-xl p-3 mb-3"
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
              className="bg-green-700 py-4 rounded-2xl mb-8"
            >
              <Text className="text-white text-center font-bold text-lg">
                Update Info
              </Text>
            </TouchableOpacity>

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
              />
            </View>
            <TouchableOpacity
              onPress={handleChangePassword}
              className="bg-yellow-500 py-4 rounded-2xl mb-8"
            >
              <Text className="text-white text-center font-bold text-lg">
                Change Password
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-600 py-4 rounded-2xl mb-10"
            >
              <Text className="text-white text-center font-bold text-lg">Logout</Text>
            </TouchableOpacity>

            {/* Delete Account */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="bg-gray-800 py-4 rounded-2xl mb-12"
            >
              <Text className="text-white text-center font-bold text-lg">
                Delete Account
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
