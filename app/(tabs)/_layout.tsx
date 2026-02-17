// Tab layout - bottom navigation
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { COLORS } from '../../utils/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#FF5722',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 8,
                    backgroundColor: COLORS.white,
                    borderTopWidth: 1,
                    borderTopColor: '#f0f0f0',
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                },
                headerShown: false, // We'll use a custom header in the screens
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'PLAY',
                    tabBarIcon: ({ color }) => <TabBarIcon name="🏟️" color={color} />,
                }}
            />
            <Tabs.Screen
                name="shop"
                options={{
                    title: 'SHOP',
                    tabBarIcon: ({ color }) => <TabBarIcon name="🛍️" color={color} />,
                }}
            />
            <Tabs.Screen
                name="coaching"
                options={{
                    title: 'COACHING',
                    tabBarIcon: ({ color }) => <TabBarIcon name="📣" color={color} />,
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    title: 'EVENTS',
                    tabBarIcon: ({ color }) => <TabBarIcon name="⭐" color={color} />,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: 'MORE',
                    tabBarIcon: ({ color }) => <TabBarIcon name="🧭" color={color} />,
                }}
            />
        </Tabs>
    );
}

// Simple emoji icon component
function TabBarIcon({ name, color }: { name: string; color: string }) {
    return <Text style={{ fontSize: 24, color }}>{name}</Text>;
}
