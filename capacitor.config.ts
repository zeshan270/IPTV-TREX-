import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.iptvtrex.app",
  appName: "IPTV TREX",
  webDir: "out",
  server: {
    // Production: load from Vercel deployment (keeps API routes working)
    url: "https://iptv-trex.vercel.app",
    // For development: connect to local dev server instead
    // url: "http://192.168.1.x:3000",
    // cleartext: true,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0d0d14",
      showSpinner: false,
      launchAutoHide: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0d0d14",
    },
    Keyboard: {
      resize: "body",
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#0d0d14",
    // Full-screen immersive mode for TV
    webContentsDebuggingEnabled: false,
  },
};

export default config;
