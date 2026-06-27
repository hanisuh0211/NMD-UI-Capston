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
        "expo-media-library",
        {
          photosPermission: "리캡 이미지를 갤러리에 저장하기 위해 사진 접근이 필요해요.",
          savePhotosPermission: "리캡 이미지를 갤러리에 저장하기 위해 사진 접근이 필요해요.",
          isAccessMediaLocationEnabled: false,
        },
      ],
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
      // 키는 .env(추적 제외)에서만 주입. 절대 하드코딩하지 말 것.
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
    fonts: [
      "./assets/fonts/JejuSamdasooBrand-Regular.otf",
      "./assets/fonts/JejuSamdasooBrand-Bold.otf",
      "./assets/fonts/JejuSamdasuSpecial.otf",
    ],
  },
};
