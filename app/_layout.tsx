import { Stack } from "expo-router";
import "../global.css";
import { initDB } from "../src/db/database";

initDB().catch(console.error);

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
