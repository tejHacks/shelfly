// app/_layout.tsx
import { Stack } from "expo-router";
import "../global.css";
import { initDB } from "../src/db/database";
import { AuthProvider } from "../src/context/AuthContext";

// Initialize DB once
initDB().catch((err) => console.error("DB init failed:", err));

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}