import type { CapacitorConfig } from "@capacitor/cli";

// FisioApp native shell (iOS + Android) built with Capacitor.
//
// The app runs as a static SPA (TanStack Start `spa` mode → dist/client) loaded
// into a native WebView. There is NO server on-device: the AI Doctor endpoint
// (/api/chat) is served by the deployed Cloudflare worker (dist/server) and the
// client calls it via VITE_API_BASE_URL (see src/lib/api-base.ts).
//
// appId is permanent once an app is published — confirm the final reverse-domain
// id with the store accounts before the first submission.
const config: CapacitorConfig = {
  appId: "com.fisioapp.app",
  appName: "FisioApp",
  webDir: "dist/client",
  server: {
    // https scheme on Android avoids mixed-content blocks when the WebView
    // calls the https API. iOS uses capacitor:// by default.
    androidScheme: "https",
  },
  ios: {
    contentInset: "always",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#0F1C47",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#2563EB",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
