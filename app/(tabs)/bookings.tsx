// My Bookings Screen - List user's bookings
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { getUserBookings } from '../../services/api';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/theme';
import BookingCard from '../../components/turf/BookingCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import type { Booking } from '../../types';

export default function BookingsScreen() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadBookings = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        const response = await getUserBookings();

        if (response.success && response.data) {
            setBookings(response.data);
        } else {
            setError(response.error || 'Failed to load bookings');
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const onRefresh = useCallback(() => {
        loadBookings(true);
    }, []);

    if (loading && !refreshing) {
        return <LoadingSpinner message="Loading your bookings..." />;
    }

    if (error && !refreshing) {
        return <ErrorMessage message={error} onRetry={() => loadBookings()} />;
    }

    if (bookings.length === 0) {
        return (
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.emptyContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Text style={styles.emptyEmoji}>📝</Text>
                <Text style={styles.emptyTitle}>No bookings yet</Text>
                <Text style={styles.emptyText}>
                    Book your first slot and it will appear here!
                </Text>
            </ScrollView>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {bookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: SPACING.lg,
    },
    emptyTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
