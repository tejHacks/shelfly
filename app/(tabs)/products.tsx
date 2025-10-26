import { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  getProductsByOwner,
  deleteProductById, 
  Product,
  User,
} from "../../src/db/database";

export default function Products() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load user and products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem("loggedInUser");
      if (!storedUser) {
        router.replace("/(auth)/login");
        return;
      }

      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);

      const data = await getProductsByOwner(parsedUser.email);
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // 🔹 Reload whenever screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  // 🔹 Delete a product
  const handleDelete = async (id: number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProductById(id); // ✅ fixed name
              await fetchProducts(); // refresh after deletion
              Alert.alert("Deleted", "Product deleted successfully ✅");
            } catch (err) {
              console.error("Error deleting product:", err);
              Alert.alert("Error", "Could not delete the product.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#15803d" />
        <Text className="text-gray-500 mt-3">Loading your products...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <View className="mt-6 mb-4">
        <Text className="text-3xl font-extrabold text-green-700">Products</Text>
        <Text className="text-gray-500 mt-1">
          {user?.name
            ? `${user.name.split(" ")[0]}'s Inventory`
            : "Manage your inventory easily."}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {products.length === 0 ? (
          <View className="flex-1 items-center justify-center mt-20">
            <Text className="text-gray-500 text-lg mb-4">No products yet.</Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/add")}
              className="bg-green-700 px-6 py-4 rounded-2xl"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">
                + Add Your First Product
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          products.map((item) => (
            <View
              key={item.id}
              className="flex-row bg-gray-100 rounded-2xl p-4 mb-4 items-center"
            >
              <Image
                source={{
                  uri:
                    item.imageUri ||
                    "https://via.placeholder.com/80/cccccc/ffffff?text=No+Image",
                }}
                className="w-16 h-16 rounded-xl mr-4"
              />

              <View className="flex-1">
                <Text className="text-gray-800 font-semibold text-base">
                  {item.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  Qty: {item.quantity} • ₦{item.price.toLocaleString()}
                </Text>
              </View>

              {/* 🔹 Edit Button */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/add",
                    params: { editId: item.id!.toString() },
                  })
                }
                className="bg-green-200 px-3 py-2 rounded-xl mr-2"
              >
                <Text className="text-green-700 font-semibold text-sm">Edit</Text>
              </TouchableOpacity>

              {/* 🔹 Delete Button */}
              <TouchableOpacity
                onPress={() => handleDelete(item.id!)}
                className="bg-red-200 px-3 py-2 rounded-xl"
              >
                <Text className="text-red-700 font-semibold text-sm">Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)/add")}
        className="bg-green-700 py-4 rounded-2xl mb-6"
        activeOpacity={0.9}
      >
        <Text className="text-center text-white font-bold text-lg">
          + Add New Product
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
