// Root layout - sets up expo-router and error boundary
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ErrorBoundary from '../components/ErrorBoundary';
import { BookingProvider } from '../context/BookingContext';

export default function RootLayout() {
    return (
        <>
            <BookingProvider>
                <ErrorBoundary>
                    <StatusBar style="dark" />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="login" />
                        <Stack.Screen name="otp" />
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
                    </Stack>
                </ErrorBoundary>
            </BookingProvider>
        </>
    );
}
