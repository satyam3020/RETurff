// Your Bookings Screen — reads from shared booking store (user + admin synced)
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';
import { useBookings, ConfirmedBooking } from '../../context/BookingContext';

// Admin uses: pending | approved | completed | cancelled | rejected
// Map all of these to user-friendly display
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: 'Payment Pending', bg: '#FFF3E0', color: '#FF9800' },
    payment_pending: { label: 'Payment Pending', bg: '#FFF3E0', color: '#FF9800' },
    approved: { label: 'Upcoming ✅', bg: '#E8F5E9', color: '#4CAF50' },
    upcoming: { label: 'Upcoming', bg: '#E8F5E9', color: '#4CAF50' },
    completed: { label: 'Completed', bg: '#E3F2FD', color: '#2196F3' },
    cancelled: { label: 'Cancelled', bg: '#FFEBEE', color: '#F44336' },
    rejected: { label: 'Rejected', bg: '#F3E5F5', color: '#9C27B0' },
};

const VENUE_IMAGE = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400';

export default function BookingsScreen() {
    const { bookings, refreshBookings, isLoading } = useBookings();
    const [refreshing, setRefreshing] = useState(false);

    // Auto-refresh every time the user opens/returns to this tab
    // so admin status changes (approved/cancelled/etc) are visible immediately
    useFocusEffect(
        useCallback(() => {
            refreshBookings();
        }, [refreshBookings])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshBookings();
        setRefreshing(false);
    }, [refreshBookings]);

    // Categorise by admin status
    const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'payment_pending');
    const approvedBookings = bookings.filter(b => b.status === 'approved' || b.status === 'upcoming');
    const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected');

    const renderBookingCard = (booking: ConfirmedBooking) => {
        const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
        // Support both normalized and legacy booking shapes
        const venueName = booking.venueName || (booking as any).turfName || 'Unknown Venue';
        const startTime = booking.startTime || booking.slots?.[0]?.time.split(' - ')[0] || '';
        const endTime = booking.endTime || booking.slots?.[booking.slots.length - 1]?.time.split(' - ')[1] || '';

        return (
            <TouchableOpacity key={booking._id} style={styles.bookingCard} activeOpacity={0.9}>
                <Image source={{ uri: VENUE_IMAGE }} style={styles.bookingImage} />

                {/* Status banner for pending */}
                {(booking.status === 'pending' || booking.status === 'payment_pending') && (
                    <View style={styles.pendingBanner}>
                        <Ionicons name="time-outline" size={14} color="#FF9800" />
                        <Text style={styles.pendingBannerText}>Awaiting admin confirmation · Pay at venue</Text>
                    </View>
                )}
                {booking.status === 'approved' && (
                    <View style={[styles.pendingBanner, { backgroundColor: '#E8F5E9', borderBottomColor: '#C8E6C9' }]}>
                        <Ionicons name="checkmark-circle-outline" size={14} color="#4CAF50" />
                        <Text style={[styles.pendingBannerText, { color: '#4CAF50' }]}>Booking confirmed by admin!</Text>
                    </View>
                )}

                <View style={styles.bookingContent}>
                    <View style={styles.bookingHeader}>
                        <Text style={styles.venueName} numberOfLines={1}>{venueName}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                            <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                        </View>
                    </View>

                    {booking.sport && (
                        <View style={styles.sportRow}>
                            <MaterialCommunityIcons name="soccer" size={14} color="#888" />
                            <Text style={styles.sportText}>{booking.sport}</Text>
                        </View>
                    )}

                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="calendar" size={16} color="#FF5722" />
                            <Text style={styles.detailText}>{booking.date}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color="#FF5722" />
                            <Text style={styles.detailText}>{startTime}{endTime ? ` - ${endTime}` : ''}</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.price}>₹{booking.totalAmount.toLocaleString('en-IN')}</Text>
                        <View style={styles.paymentStatus}>
                            <View style={[styles.payDot, { backgroundColor: booking.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800' }]} />
                            <Text style={styles.payText}>{booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus === 'refunded' ? 'Refunded' : 'Pay at venue'}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSection = (title: string, data: ConfirmedBooking[], icon: string) => {
        if (data.length === 0) return null;
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{icon} {title}</Text>
                    <Text style={styles.sectionCount}>{data.length}</Text>
                </View>
                {data.map(renderBookingCard)}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Bookings</Text>
                {bookings.length > 0 && (
                    <Text style={styles.headerCount}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</Text>
                )}
            </View>

            {isLoading && bookings.length === 0 ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#FF5722" />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} tintColor="#FF5722" />}
                >
                    {bookings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="calendar-blank" size={80} color="#E0E0E0" />
                            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                            <Text style={styles.emptyText}>Browse venues in the Play tab and book your first turf!</Text>
                        </View>
                    ) : (
                        <>
                            {renderSection('Awaiting Confirmation', pendingBookings, '⏳')}
                            {renderSection('Confirmed Bookings', approvedBookings, '✅')}
                            {renderSection('Past Bookings', pastBookings, '📋')}
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
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    headerCount: { fontSize: 13, color: '#888' },
    scrollView: { flex: 1 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
    section: { marginTop: SPACING.md },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
    sectionCount: { fontSize: 12, color: '#888', backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    bookingCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    bookingImage: { width: '100%', height: 100, resizeMode: 'cover' },
    pendingBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#FFF8E1', paddingHorizontal: SPACING.md, paddingVertical: 6,
        borderBottomWidth: 1, borderBottomColor: '#FFE082',
    },
    pendingBannerText: { fontSize: 12, fontWeight: '600', color: '#FF9800' },
    bookingContent: { padding: SPACING.md },
    bookingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    venueName: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#333', marginRight: 8 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '700' },
    sportRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
    sportText: { fontSize: 12, color: '#888' },
    detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: SPACING.sm },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailText: { fontSize: 13, color: '#666' },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    price: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    paymentStatus: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    payDot: { width: 7, height: 7, borderRadius: 4 },
    payText: { fontSize: 12, color: '#888' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: SPACING.xl },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: SPACING.lg, marginBottom: SPACING.sm },
    emptyText: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
});
