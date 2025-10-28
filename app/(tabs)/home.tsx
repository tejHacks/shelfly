import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getProductsByOwner, User, Product } from "../../src/db/database";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user + products
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem("loggedInUser");
      if (!storedUser) {
        router.replace("/(auth)/login");
        return;
      }

      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);

      const userProducts = await getProductsByOwner(parsedUser.email);
      setProducts(userProducts);
    } catch (err) {
      console.error("Error loading user or products:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);


  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#15803d" />
        <Text className="text-gray-500 mt-3">Loading your store...</Text>
      </SafeAreaView>
    );
  }

  const lowStock = products.filter((p) => p.quantity <= 3);

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 30 }}
      >
        {/* Greeting */}
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-green-700">
            Welcome back, {user?.name?.split(" ")[0] || "Storekeeper"} 
          </Text>
          <Text className="text-gray-500 mt-1">
            Here’s what’s happening in your store today.
          </Text>
        </View>

        {/* Stats Section */}
        <View className="flex-row justify-between mt-4">
          <View className="bg-green-100 flex-1 mr-3 rounded-2xl p-4">
            <Text className="text-green-800 font-semibold text-sm">Total Products</Text>
            <Text className="text-3xl font-bold text-green-900 mt-1">{products.length}</Text>
          </View>

          <View className="bg-yellow-100 flex-1 ml-3 rounded-2xl p-4">
            <Text className="text-yellow-800 font-semibold text-sm">Low Stock</Text>
            <Text className="text-3xl font-bold text-yellow-900 mt-1">
              {lowStock.length}
            </Text>
          </View>
        </View>

        {/* Products Section */}
        <View className="mt-10">
          <Text className="text-lg font-semibold text-gray-700 mb-3">
            Recently Added
          </Text>

          {products.length === 0 ? (
            <View className="bg-gray-100 rounded-2xl p-6 items-center justify-center">
              <Text className="text-gray-500 text-center mb-4">
                No products yet. Add your first product below
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/(tabs)/add")}
                className="bg-green-700 px-6 py-4 rounded-2xl"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-lg">+ Add Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {products.slice(0, 5).map((product) => (
                <View
                  key={product.id}
                  className="bg-gray-100 rounded-2xl p-4 mb-3"
                >
                  <Text className="text-gray-800 font-semibold">{product.name}</Text>
                  <Text className="text-gray-500 text-sm">
                    Quantity: {product.quantity} • ₦{product.price.toLocaleString()}
                  </Text>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => router.push("/(tabs)/products")}
                className="mt-5 bg-green-700 py-4 rounded-2xl"
                activeOpacity={0.8}
              >
                <Text className="text-center text-white font-bold text-lg">
                  View All Products
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
