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
  const isEdit = !!editId;

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const [product, setProduct] = useState<Partial<Product>>({
    name: "",
    quantity: 0,
    price: 0,
    imageUri: null,
  });

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      const storedUser = await AsyncStorage.getItem("loggedInUser");
      if (storedUser) setUser(JSON.parse(storedUser));

      if (isEdit) {
        const existing = await getProductById(Number(editId));
        if (existing) {
          setProduct({
            id: existing.id,
            name: existing.name,
            quantity: existing.quantity,
            price: existing.price,
            imageUri: existing.imageUri || null,
          });
        }
      } else {
        setProduct({ name: "", quantity: 0, price: 0, imageUri: null });
      }
    })();
  }, [editId, isEdit]);

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setProduct((prev) => ({ ...prev, imageUri: result.assets[0].uri }));
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setProduct((prev) => ({ ...prev, imageUri: result.assets[0].uri }));
    }
  };

  const handleSave = async () => {
    if (!user) return Alert.alert("Error", "User not logged in.");
    if (!product.name?.trim()) return Alert.alert("Error", "Product name is required.");
    if (!product.quantity || product.quantity <= 0) return Alert.alert("Error", "Valid quantity required.");
    if (!product.price || product.price <= 0) return Alert.alert("Error", "Valid price required.");

    try {
      setLoading(true);

      const newProduct: Product = {
        id: product.id,
        ownerEmail: user.email,
        name: product.name.trim(),
        quantity: Number(product.quantity),
        price: Number(product.price),
        imageUri: product.imageUri || null,
      };

      if (isEdit) {
        await updateProduct(newProduct);
        Alert.alert("Success", "Product updated!");
      } else {
        await insertProduct(newProduct);
        Alert.alert("Success", "Product added!");
        setProduct({ name: "", quantity: 0, price: 0, imageUri: null });
      }

      router.replace("/(tabs)/products");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#15803d" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-extrabold text-green-700 mt-6">
          {isEdit ? "Edit Product" : "Add Product"}
        </Text>
        <Text className="text-gray-500 mb-6">
          {isEdit ? "Update product details." : "Add a new product to your store."}
        </Text>

        {/* Name */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">Product Name</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-3"
            value={product.name || ""}
            onChangeText={(text) => setProduct({ ...product, name: text })}
            placeholder="Enter name"
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
            placeholder="0"
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
            placeholder="0.00"
          />
        </View>

        {/* Image */}
        <View className="mb-6 items-center">
          {product.imageUri ? (
            <Image
              source={{ uri: product.imageUri }}
              className="w-full h-64 rounded-2xl mb-4"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-48 rounded-2xl bg-gray-100 mb-4 items-center justify-center">
              <Text className="text-gray-400">No image</Text>
            </View>
          )}

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={handleTakePhoto}
              className="bg-green-700 px-6 py-3 rounded-xl flex-1"
            >
              <Text className="text-white font-bold text-center">Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePickImage}
              className="bg-blue-600 px-6 py-3 rounded-xl flex-1"
            >
              <Text className="text-white font-bold text-center">Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`py-4 rounded-2xl mb-10 ${
            loading ? "bg-gray-400" : "bg-green-700"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center text-white font-bold text-lg">
              {isEdit ? "Update Product" : "Add Product"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}