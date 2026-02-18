// Your Bookings Screen - Shows user's booked turfs
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/theme';
// import { getUserBookings } from '../../services/api'; // Removed mock API
import { useBookings, ConfirmedBooking } from '../../context/BookingContext'; // Import context
// import type { Booking } from '../../types'; // Replaced by ConfirmedBooking

// Status config for badge colors and labels
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
    payment_pending: { label: 'Payment Pending', bg: '#FFF3E0', color: '#FF9800' },
    upcoming: { label: 'Upcoming', bg: '#E8F5E9', color: '#4CAF50' },
    completed: { label: 'Completed', bg: '#E3F2FD', color: '#2196F3' },
    cancelled: { label: 'Cancelled', bg: '#FFEBEE', color: '#F44336' },
};

// Venue images map (fallback)
const VENUE_IMAGE = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400';

export default function BookingsScreen() {
    const { bookings, refreshBookings } = useBookings();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshBookings();
        setRefreshing(false);
    }, [refreshBookings]);

    const pendingBookings = bookings.filter(b => b.status === 'payment_pending');
    const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
    const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

    const renderBookingCard = (booking: ConfirmedBooking) => {
        const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.upcoming;

        // Format date nicely (assuming booking.date is consistent)
        // const dateObj = new Date(booking.date);
        // const formattedDate = isNaN(dateObj.getTime())
        //    ? booking.date
        //    : dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const formattedDate = booking.date;

        // Get start and end time from the first slot or aggregate
        const startTime = booking.slots[0]?.time.split(' - ')[0] || '';
        const endTime = booking.slots[booking.slots.length - 1]?.time.split(' - ')[1] || '';

        return (
            <TouchableOpacity key={booking.id} style={styles.bookingCard}>
                <Image source={{ uri: VENUE_IMAGE }} style={styles.bookingImage} />

                {/* Payment Pending banner */}
                {booking.status === 'payment_pending' && (
                    <View style={styles.pendingBanner}>
                        <Ionicons name="time-outline" size={14} color="#FF9800" />
                        <Text style={styles.pendingBannerText}>Payment Pending — Pay at venue</Text>
                    </View>
                )}

                <View style={styles.bookingContent}>
                    <View style={styles.bookingHeader}>
                        <Text style={styles.venueName} numberOfLines={1}>{booking.turfName}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                            <Text style={[styles.statusText, { color: statusCfg.color }]}>
                                {statusCfg.label}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="calendar" size={16} color="#FF5722" />
                            <Text style={styles.detailText}>{formattedDate}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color="#FF5722" />
                            <Text style={styles.detailText}>{startTime} - {endTime}</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.price}>₹{booking.totalAmount.toLocaleString('en-IN')}</Text>
                        <TouchableOpacity style={styles.viewButton}>
                            <Text style={styles.viewButtonText}>View Details</Text>
                            <Ionicons name="chevron-forward" size={16} color="#FF5722" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderSection = (title: string, data: ConfirmedBooking[]) => {
        if (data.length === 0) return null;
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{title}</Text>
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

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} />}
            >
                {bookings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="calendar-blank" size={80} color="#E0E0E0" />
                        <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                        <Text style={styles.emptyText}>
                            Book your first turf and start playing!
                        </Text>
                    </View>
                ) : (
                    <>
                        {renderSection('⏳ Payment Pending', pendingBookings)}
                        {renderSection('Upcoming Bookings', upcomingBookings)}
                        {renderSection('Past Bookings', pastBookings)}
                    </>
                )}

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
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
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    headerCount: {
        fontSize: 13,
        color: '#888',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginTop: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    bookingCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bookingImage: {
        width: '100%',
        height: 110,
        resizeMode: 'cover',
    },
    pendingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFF8E1',
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#FFE082',
    },
    pendingBannerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF9800',
    },
    bookingContent: {
        padding: SPACING.md,
    },
    bookingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    venueName: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: SPACING.sm,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 13,
        color: '#666',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.sm,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF5722',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: SPACING.xl,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});
