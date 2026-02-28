// Booking History Screen — shows completed, cancelled, rejected bookings
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { COLORS, SPACING } from '../utils/theme';
import { getUserBookingHistory } from '../services/api';

interface HistoryBooking {
    _id: string;
    venueName: string;
    venueLocation?: string;
    date: string;
    startTime: string;
    endTime: string;
    sport?: string;
    status: 'completed' | 'cancelled' | 'rejected';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    totalAmount: number;
    createdAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: string }> = {
    completed: { label: 'Completed', bg: '#E3F2FD', color: '#2196F3', icon: 'checkmark-circle' },
    cancelled: { label: 'Cancelled', bg: '#FFEBEE', color: '#F44336', icon: 'close-circle' },
    rejected: { label: 'Rejected', bg: '#F3E5F5', color: '#9C27B0', icon: 'alert-circle' },
};

const VENUE_IMAGE = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400';

const formatDate = (dateStr: string): string => {
    try {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

export default function BookingHistoryScreen() {
    const [bookings, setBookings] = useState<HistoryBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = useCallback(async () => {
        try {
            const res = await getUserBookingHistory();
            if (res.success && Array.isArray(res.data)) {
                setBookings(res.data);
            }
        } catch (err) {
            console.warn('Could not fetch booking history', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [fetchHistory])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchHistory();
    }, [fetchHistory]);

    const renderBookingCard = (booking: HistoryBooking) => {
        const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.completed;

        return (
            <TouchableOpacity
                key={booking._id}
                style={styles.bookingCard}
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: '/booking-detail', params: { bookingId: booking._id } })}
            >
                <Image source={{ uri: VENUE_IMAGE }} style={styles.bookingImage} />

                {/* Status banner */}
                <View style={[styles.statusBanner, { backgroundColor: cfg.bg }]}>
                    <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
                    <Text style={[styles.statusBannerText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>

                <View style={styles.bookingContent}>
                    <Text style={styles.venueName} numberOfLines={1}>{booking.venueName || 'Unknown Venue'}</Text>

                    {booking.sport && (
                        <View style={styles.sportRow}>
                            <MaterialCommunityIcons name="soccer" size={14} color="#888" />
                            <Text style={styles.sportText}>{booking.sport}</Text>
                        </View>
                    )}

                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="calendar" size={16} color="#999" />
                            <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color="#999" />
                            <Text style={styles.detailText}>{booking.startTime} - {booking.endTime}</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.price}>₹{booking.totalAmount.toLocaleString('en-IN')}</Text>
                        <View style={styles.paymentStatus}>
                            <View style={[styles.payDot, { backgroundColor: booking.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800' }]} />
                            <Text style={styles.payText}>
                                {booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus === 'refunded' ? 'Refunded' : 'Unpaid'}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Booking History</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#FF5722" />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} tintColor="#FF5722" />}
                >
                    {bookings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="history" size={80} color="#E0E0E0" />
                            <Text style={styles.emptyTitle}>No History Yet</Text>
                            <Text style={styles.emptyText}>Your completed bookings will appear here once a session is over.</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.sectionLabel}>📋 Past Bookings ({bookings.length})</Text>
                            {bookings.map(renderBookingCard)}
                        </>
                    )}
                    <View style={{ height: 24 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    scrollView: { flex: 1 },
    scrollContent: { padding: SPACING.md },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
    sectionLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        paddingHorizontal: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    bookingCard: {
        backgroundColor: COLORS.white,
        marginBottom: SPACING.md,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    bookingImage: { width: '100%', height: 80, resizeMode: 'cover' },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    statusBannerText: { fontSize: 12, fontWeight: '600' },
    bookingContent: { padding: SPACING.md },
    venueName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    sportRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
    sportText: { fontSize: 12, color: '#888' },
    detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: SPACING.sm },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailText: { fontSize: 13, color: '#666' },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    price: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    paymentStatus: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    payDot: { width: 7, height: 7, borderRadius: 4 },
    payText: { fontSize: 12, color: '#888' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: SPACING.xl },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: SPACING.lg, marginBottom: SPACING.sm },
    emptyText: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
});
