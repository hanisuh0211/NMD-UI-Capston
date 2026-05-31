import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Colors, Space, FontSize, LineHeight } from '../../theme';

import HomeIcon from '../../assets/icons/home.svg';
import ExploreIcon from '../../assets/icons/explore.svg';
import BarChartIcon from '../../assets/icons/bar_chart.svg';
import AccountCircleIcon from '../../assets/icons/account_circle.svg';

function NavIcon({ label, focused, Icon }: {
  label: string;
  focused: boolean;
  Icon: React.FC<{ width?: number; height?: number; color?: string }>;
}) {
  const color = focused ? Colors.blue500 : Colors.gray400;
  return (
    <View style={{ alignItems: 'center', gap: Space.s050 }}>
      <Icon width={24} height={24} color={color} />
      <Text style={{
        fontSize: FontSize.size050,
        fontWeight: '300',
        lineHeight: LineHeight.lh050,
        letterSpacing: -0.2,
        color,
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
        options={{ tabBarIcon: ({ focused }) => <NavIcon label="메인" focused={focused} Icon={HomeIcon} /> }}
      />
      <Tabs.Screen
        name="feed"
        options={{ tabBarIcon: ({ focused }) => <NavIcon label="피드" focused={focused} Icon={ExploreIcon} /> }}
      />
      <Tabs.Screen
        name="stats"
        options={{ tabBarIcon: ({ focused }) => <NavIcon label="통계" focused={focused} Icon={BarChartIcon} /> }}
      />
      <Tabs.Screen
        name="my"
        options={{ tabBarIcon: ({ focused }) => <NavIcon label="마이" focused={focused} Icon={AccountCircleIcon} /> }}
      />
    </Tabs>
  );
}
