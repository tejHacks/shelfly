import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Text, TouchableOpacity, Animated, ScrollView, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideButton = useRef(new Animated.Value(80)).current;
  const leftText = useRef(new Animated.Value(-150)).current;
  const rightText = useRef(new Animated.Value(150)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(leftText, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(rightText, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(slideButton, { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.timing(buttonOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();
  }, [buttonOpacity, fadeAnim, leftText, rightText, slideButton]);

  return (
    <SafeAreaProvider className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Shelfly Title */}
        <View className="flex-row items-end space-x-2">
          <Animated.View style={{ transform: [{ translateX: leftText }] }}>
            <Text className="text-green-700 text-6xl font-extrabold">Shelf</Text>
          </Animated.View>
          <Animated.View style={{ transform: [{ translateX: rightText }] }}>
            <Text className="text-gray-800 text-6xl font-extrabold">ly</Text>
          </Animated.View>
        </View>

        {/* Tagline */}
        <Animated.Text
          style={{ opacity: fadeAnim }}
          className="text-gray-600 text-lg mt-6 text-center px-4"
        >
          Manage smarter. Store better.  
          Keep every product in check with ease.
        </Animated.Text>

        {/* Proceed Button */}
        <Animated.View
          style={{
            transform: [{ translateY: slideButton }],
            opacity: buttonOpacity,
            width: "100%",
          }}
          className="px-10 mt-14"
        >
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/signup")}
            className="bg-green-700 py-4 rounded-2xl"
            activeOpacity={0.8}
          >
            <Text className="text-center text-white text-lg font-bold">
              Get Started
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaProvider>
  );
}
