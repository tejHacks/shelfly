// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#047857",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 2,
          borderTopColor: "#E5E7EB",
          height: 90,
          paddingBottom: 15,
          paddingTop: 6,
          borderTopStartRadius: 15,
          borderTopEndRadius: 15,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                backgroundColor: focused ? "#047857" : "transparent",
                borderRadius: 30,
                width: 56,
                height: 56,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: focused ? 20 : 0,
                shadowColor: focused ? "#000" : "transparent",
                shadowOffset: focused ? { width: 0, height: 2 } : undefined,
                shadowOpacity: focused ? 0.2 : 0,
                shadowRadius: focused ? 4 : 0,
                elevation: focused ? 5 : 0,
              }}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={26}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />

      {/* ADD — NO FLOAT, NORMAL ICON */}
      

      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                backgroundColor: focused ? "#047857" : "transparent",
                borderRadius: 30,
                width: 56,
                height: 56,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: focused ? 20 : 0,
                shadowColor: focused ? "#000" : "transparent",
                shadowOffset: focused ? { width: 0, height: 2 } : undefined,
                shadowOpacity: focused ? 0.2 : 0,
                shadowRadius: focused ? 4 : 0,
                elevation: focused ? 5 : 0,
              }}
            >
              <Ionicons
                name={focused ? "add" : "add-circle-outline"}
                size={26}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />

      {/* PRODUCTS */}
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                backgroundColor: focused ? "#047857" : "transparent",
                borderRadius: 30,
                width: 56,
                height: 56,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: focused ? 20 : 0,
                shadowColor: focused ? "#000" : "transparent",
                shadowOffset: focused ? { width: 0, height: 2 } : undefined,
                shadowOpacity: focused ? 0.2 : 0,
                shadowRadius: focused ? 4 : 0,
                elevation: focused ? 5 : 0,
              }}
            >
              <Ionicons
                name={focused ? "cube" : "cube-outline"}
                size={26}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />

      {/* SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                backgroundColor: focused ? "#047857" : "transparent",
                borderRadius: 30,
                width: 56,
                height: 56,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: focused ? 20 : 0,
                shadowColor: focused ? "#000" : "transparent",
                shadowOffset: focused ? { width: 0, height: 2 } : undefined,
                shadowOpacity: focused ? 0.2 : 0,
                shadowRadius: focused ? 4 : 0,
                elevation: focused ? 5 : 0,
              }}
            >
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={26}
                color={focused ? "#FFFFFF" : color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}