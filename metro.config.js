const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg', 'cjs'],
  // Firebase JS SDK가 RN 빌드(getReactNativePersistence 포함)로 해석되도록
  // package "exports" 필드 해석을 끔 (Expo + Firebase 호환 이슈 해결)
  unstable_enablePackageExports: false,
};

module.exports = config;
