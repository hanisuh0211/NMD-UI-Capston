import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { Colors, Space, FontSize, LineHeight } from '../../theme';
import { Icons } from '../../icons';

function NavIcon({ label, focused, icon: IconComponent }: {
  label: string; focused: boolean; icon: React.FC<SvgProps>; activeIcon?: React.FC<SvgProps>;
}) {
  return (
    <View style={{ alignItems: 'center', gap: Space.s050 }}>
      <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
        <IconComponent
          width={24}
          height={24}
          color={focused ? Colors.blue500 : Colors.gray400}
        />
      </View>
      <Text style={{
        fontSize: FontSize.size050,
        fontWeight: '300',
        lineHeight: LineHeight.lh050,
        letterSpacing: -0.2,
        color: focused ? Colors.blue500 : Colors.gray400,
        fontFamily: 'Pretendard-Light',
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.gray050,
          borderTopWidth: 1,
          borderTopColor: Colors.gray200,
          height: 80,
          paddingBottom: Space.s500,
          paddingTop: Space.s150,
          paddingHorizontal: Space.s200,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <NavIcon label="메인" focused={focused} icon={Icons.home} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => (
            <NavIcon label="피드" focused={focused} icon={Icons.explore} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ focused }) => (
            <NavIcon label="통계" focused={focused} icon={Icons.barChart} />
          ),
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          tabBarIcon: ({ focused }) => (
            <NavIcon label="마이" focused={focused} icon={Icons.accountCircle} />
          ),
        }}
      />
    </Tabs>
  );
}
