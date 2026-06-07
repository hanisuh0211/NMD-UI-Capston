import React from 'react';
import { Image } from 'react-native';

// 캐릭터 id → 아바타 이미지 (분홍 별 배경이 합쳐진 Figma 에셋)
// char1=여성(node 361:2410), char2=남성(node 361:2409). 배경 분홍 별은 남/여 공통.
const AVATAR_IMAGES: Record<string, any> = {
  char1: require('../assets/images/avatar_female.png'),
  char2: require('../assets/images/avatar_male.png'),
};

export default function CharacterAvatar({
  character,
  size = 160,
}: {
  character: string;
  size?: number;
}) {
  const img = AVATAR_IMAGES[character] ?? AVATAR_IMAGES.char1;
  return (
    <Image source={img} style={{ width: size, height: size }} resizeMode="contain" />
  );
}
