// Root layout - sets up expo-router and error boundary
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ErrorBoundary from '../components/ErrorBoundary';
import { BookingProvider } from '../context/BookingContext';
import sessionEvents from '../services/sessionEvents';

export default function RootLayout() {
    // ── Listen for session expiry and redirect to login ──
    useEffect(() => {
        const onSessionExpired = () => {
            Alert.alert(
                'Session Expired',
                'Your session has expired. Please login again.',
                [{ text: 'OK', onPress: () => router.replace('/login') }],
            );
        };

        sessionEvents.on('session-expired', onSessionExpired);
        return () => { sessionEvents.off('session-expired', onSessionExpired); };
    }, []);

    return (
        <>
            <BookingProvider>
                <ErrorBoundary>
                    <StatusBar style="dark" />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="login" />
                        <Stack.Screen name="signup" />
                        <Stack.Screen name="forgot-password" />
                        <Stack.Screen name="complete-profile" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen
                            name="booking/[id]"
                            options={{
                                headerShown: true,
                                title: 'Confirm Booking',
                                presentation: 'card',
                            }}
                        />
                        <Stack.Screen
                            name="booking-history"
                            options={{
                                headerShown: false,
                                presentation: 'card',
                            }}
                        />
                        <Stack.Screen
                            name="booking-detail"
                            options={{
                                headerShown: false,
                                presentation: 'card',
                            }}
                        />
                    </Stack>
                </ErrorBoundary>
            </BookingProvider>
        </>
    );
}

