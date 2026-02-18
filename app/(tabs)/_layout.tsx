// Tab layout - bottom navigation
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
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
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="stadium" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="slots"
                options={{
                    title: 'YOUR BOOKINGS',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calendar-check" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'NOTIFICATION',
                    tabBarIcon: ({ color }) => <Ionicons name="notifications" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'PROFILE',
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
                }}
            />

            {/* Hide other tabs */}
            <Tabs.Screen
                name="shop"
                options={{
                    href: null, // This hides the tab
                }}
            />
            <Tabs.Screen
                name="coaching"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
