// Admin Layout — auth guard + light theme matching user section
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAuthUser, clearAuthData } from '../../services/api';

export default function AdminLayout() {
    const [checking, setChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => { checkAdminAccess(); }, []);

    const checkAdminAccess = async () => {
        try {
            const user = await getAuthUser();
            if (!user || user.role !== 'admin') { router.replace('/login'); return; }
            setIsAdmin(true);
        } catch { router.replace('/login'); }
        finally { setChecking(false); }
    };

    const handleLogout = async () => {
        await clearAuthData();
        router.replace('/login');
    };

    if (checking) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF5722" />
                <Text style={styles.loadingText}>Verifying access...</Text>
            </View>
        );
    }

    if (!isAdmin) return null;

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#111',
                headerTitleStyle: { fontWeight: 'bold', color: '#111' },
                headerShadowVisible: false,
                contentStyle: { backgroundColor: '#F5F5F5' },
            }}
        >
            <Stack.Screen
                name="dashboard"
                options={{
                    title: 'Admin Panel',
                    headerRight: () => (
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                            <Ionicons name="log-out-outline" size={22} color="#FF5722" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen name="venues" options={{ title: 'Venue Management' }} />
            <Stack.Screen name="slots" options={{ title: 'Slot Management' }} />
            <Stack.Screen name="bookings" options={{ title: 'Booking Management' }} />
            <Stack.Screen name="users" options={{ title: 'User Management' }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
            <Stack.Screen name="support-requests" options={{ title: 'Support Requests' }} />
        </Stack>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', gap: 12 },
    loadingText: { color: '#666', fontSize: 14 },
    logoutBtn: { marginRight: 8, padding: 4 },
});
