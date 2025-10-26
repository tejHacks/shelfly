import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import {
  getProductById,
  insertProduct,
  updateProduct,
  Product,
  User,
} from "../../src/db/database";

export default function AddOrEditProduct() {
  const router = useRouter();
  const { editId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Partial<Product>>({
    name: "",
    quantity: 0,
    price: 0,
    imageUri: null,
  });
  const [user, setUser] = useState<User | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      // Request both camera + gallery permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      const storedUser = await AsyncStorage.getItem("loggedInUser");
      if (storedUser) setUser(JSON.parse(storedUser));

      // If editId is present, load product data
      if (editId) {
        const existing = await getProductById(Number(editId));
        if (existing) setProduct(existing);
      } else {
        // Reset product fields for new add
        setProduct({
          name: "",
          quantity: 0,
          price: 0,
          imageUri: null,
        });
      }
    })();
  }, [editId]);

  // Take photo with camera
  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setProduct({ ...product, imageUri: result.assets[0].uri });
    }
  };

  // Pick image from gallery
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setProduct({ ...product, imageUri: result.assets[0].uri });
    }
  };

  // Save or Update
  const handleSave = async () => {
    if (!user) return Alert.alert("Error", "User not found.");
    if (!product.name?.trim() || !product.quantity || !product.price)
      return Alert.alert("Error", "Please fill in all fields.");

    try {
      setLoading(true);
      const newProduct: Product = {
        id: product.id,
        ownerEmail: user.email,
        name: product.name.trim(),
        quantity: Number(product.quantity),
        price: Number(product.price),
        imageUri: product.imageUri ?? null,
      };

      if (editId) {
        await updateProduct(newProduct);
        Alert.alert("Updated", "Product updated successfully");
      } else {
        await insertProduct(newProduct);
        Alert.alert("Added", "Product added successfully ");
      }

      // Reset after save if new
      if (!editId) {
        setProduct({
          name: "",
          quantity: 0,
          price: 0,
          imageUri: null,
        });
      }

      router.replace("/(tabs)/products");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#15803d" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-extrabold text-green-700 mt-6">
          {editId ? "Edit Product" : "Add Product"}
        </Text>
        <Text className="text-gray-500 mb-6">
          {editId
            ? "Update the details of your product below."
            : "Fill out details to add a new product."}
        </Text>

        {/* Product Name */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Product Name</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-3"
            value={product.name || ""}
            onChangeText={(text) => setProduct({ ...product, name: text })}
            placeholder="Enter product name"
          />
        </View>

        {/* Quantity */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Quantity</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-3"
            keyboardType="numeric"
            value={product.quantity?.toString() || ""}
            onChangeText={(text) =>
              setProduct({ ...product, quantity: parseInt(text) || 0 })
            }
            placeholder="Enter quantity"
          />
        </View>

        {/* Price */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Price (₦)</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-3"
            keyboardType="numeric"
            value={product.price?.toString() || ""}
            onChangeText={(text) =>
              setProduct({ ...product, price: parseFloat(text) || 0 })
            }
            placeholder="Enter price"
          />
        </View>

        {/* Product Image Section */}
        <View className="mb-6 items-center">
          {product.imageUri ? (
            <Image
              source={{ uri: product.imageUri }}
              className="w-48 h-48 rounded-2xl mb-3"
            />
          ) : (
            <View className="w-48 h-48 rounded-2xl bg-gray-100 mb-3 items-center justify-center">
              <Text className="text-gray-400">No image selected</Text>
            </View>
          )}

          <View className="flex-row space-x-10 my-2">
            <TouchableOpacity
              onPress={handleTakePhoto}
              className="bg-green-700 px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold text-sm">Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePickImage}
              className="bg-blue-600 px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold text-sm"> Upload Image</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`py-4 rounded-2xl mb-10 ${
            loading ? "bg-gray-400" : "bg-green-700"
          }`}
        >
          <Text className="text-center text-white font-bold text-lg">
            {loading ? "Saving..." : editId ? "Update Product" : "Add Product"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
