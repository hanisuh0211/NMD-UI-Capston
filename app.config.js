export default {
  expo: {
    name: "MyApp",
    slug: "MyApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      openaiApiKey: "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",
    },
    fonts: [
      "./assets/fonts/JejuSamdasooBrand-Regular.otf",
      "./assets/fonts/JejuSamdasooBrand-Bold.otf",
      "./assets/fonts/JejuSamdasuSpecial.otf",
    ],
  },
};
