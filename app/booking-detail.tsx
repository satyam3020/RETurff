// Booking Detail Screen — shows full booking info with dynamic status
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '../utils/theme';
import { getUserBookingById } from '../services/api';

interface BookingDetail {
    _id: string;
    venueName: string;
    venueLocation?: string;
    date: string;
    startTime: string;
    endTime: string;
    sport?: string;
    surface?: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    displayStatus: string;
    userName: string;
    userPhone: string;
    adminNote?: string;
    createdAt?: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; icon: string }> = {
    'Payment Pending': { bg: '#FFF3E0', color: '#FF9800', icon: 'time-outline' },
    'Payment Confirmed': { bg: '#E8F5E9', color: '#4CAF50', icon: 'card-outline' },
    'Booking Confirmed': { bg: '#E3F2FD', color: '#2196F3', icon: 'checkmark-circle' },
    'Completed': { bg: '#F3E5F5', color: '#9C27B0', icon: 'trophy-outline' },
    'Cancelled': { bg: '#FFEBEE', color: '#F44336', icon: 'close-circle' },
    'Rejected': { bg: '#FFEBEE', color: '#F44336', icon: 'alert-circle' },
};

const formatDate = (dateStr: string): string => {
    try {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

const formatCreatedAt = (iso?: string): string => {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at '
            + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
};

export default function BookingDetailScreen() {
    const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBooking = useCallback(async () => {
        if (!bookingId) return;
        try {
            const res = await getUserBookingById(bookingId);
            if (res.success && res.data) {
                setBooking(res.data);
            }
        } catch (err) {
            console.warn('Could not fetch booking detail', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [bookingId]);

    useFocusEffect(
        useCallback(() => {
            fetchBooking();
        }, [fetchBooking])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchBooking();
    }, [fetchBooking]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Booking Details</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#FF5722" />
                </View>
            </SafeAreaView>
        );
    }

    if (!booking) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Booking Details</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loader}>
                    <Ionicons name="alert-circle-outline" size={60} color="#ccc" />
                    <Text style={styles.errorText}>Booking not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusStyle = STATUS_STYLES[booking.displayStatus] || STATUS_STYLES['Payment Pending'];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Booking Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} tintColor="#FF5722" />}
            >
                {/* Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: statusStyle.bg }]}>
                    <Ionicons name={statusStyle.icon as any} size={28} color={statusStyle.color} />
                    <View style={styles.statusTextContainer}>
                        <Text style={[styles.statusLabel, { color: statusStyle.color }]}>{booking.displayStatus}</Text>
                        <Text style={styles.statusSubtext}>
                            {booking.displayStatus === 'Payment Pending' && 'Please complete payment at the venue'}
                            {booking.displayStatus === 'Payment Confirmed' && 'Payment received. Waiting for admin approval'}
                            {booking.displayStatus === 'Booking Confirmed' && 'Your booking is confirmed! See you there'}
                            {booking.displayStatus === 'Completed' && 'This booking session has ended'}
                            {booking.displayStatus === 'Cancelled' && 'This booking was cancelled'}
                            {booking.displayStatus === 'Rejected' && 'This booking was rejected by admin'}
                        </Text>
                    </View>
                </View>

                {/* Venue Info */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="stadium-variant" size={20} color="#FF5722" />
                        <Text style={styles.cardTitle}>Venue</Text>
                    </View>
                    <Text style={styles.venueName}>{booking.venueName}</Text>
                    {booking.venueLocation ? (
                        <View style={styles.row}>
                            <Ionicons name="location-outline" size={14} color="#888" />
                            <Text style={styles.subText}>{booking.venueLocation}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Slot Details */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="calendar-clock" size={20} color="#FF5722" />
                        <Text style={styles.cardTitle}>Slot Details</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date</Text>
                        <Text style={styles.detailValue}>{formatDate(booking.date)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Time</Text>
                        <Text style={styles.detailValue}>{booking.startTime} - {booking.endTime}</Text>
                    </View>
                    {booking.sport && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Sport</Text>
                            <Text style={styles.detailValue}>{booking.sport}</Text>
                        </View>
                    )}
                    {booking.surface && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Pitch / Surface</Text>
                            <Text style={styles.detailValue}>{booking.surface}</Text>
                        </View>
                    )}
                </View>

                {/* Payment Info */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="wallet-outline" size={20} color="#FF5722" />
                        <Text style={styles.cardTitle}>Payment</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Amount</Text>
                        <Text style={styles.priceValue}>₹{booking.totalAmount.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment Method</Text>
                        <Text style={styles.detailValue}>Pay at Venue</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment Status</Text>
                        <View style={[styles.payBadge, { backgroundColor: booking.paymentStatus === 'paid' ? '#d1fae5' : '#fef3c7' }]}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: booking.paymentStatus === 'paid' ? '#059669' : '#d97706' }}>
                                {booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus === 'refunded' ? 'Refunded' : 'Unpaid'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Booking Info */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="information-circle-outline" size={20} color="#FF5722" />
                        <Text style={styles.cardTitle}>Booking Info</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Booking Status</Text>
                        <View style={[styles.payBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: statusStyle.color }}>
                                {booking.displayStatus}
                            </Text>
                        </View>
                    </View>
                    {booking.adminNote ? (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Admin Note</Text>
                            <Text style={[styles.detailValue, { flex: 1, textAlign: 'right' }]}>{booking.adminNote}</Text>
                        </View>
                    ) : null}
                    {booking.createdAt ? (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Booked On</Text>
                            <Text style={styles.detailValue}>{formatCreatedAt(booking.createdAt)}</Text>
                        </View>
                    ) : null}
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
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
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    scrollView: { flex: 1 },
    scrollContent: { padding: SPACING.md },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: '#999', marginTop: 12 },

    // Status banner
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderRadius: 16,
        marginBottom: SPACING.md,
        gap: 14,
    },
    statusTextContainer: { flex: 1 },
    statusLabel: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    statusSubtext: { fontSize: 13, color: '#666', lineHeight: 18 },

    // Cards
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING.md,
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
    venueName: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 6 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    subText: { fontSize: 13, color: '#888' },

    // Detail rows
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#fafafa',
    },
    detailLabel: { fontSize: 13, color: '#888', fontWeight: '500' },
    detailValue: { fontSize: 14, color: '#333', fontWeight: '600' },
    priceValue: { fontSize: 18, fontWeight: 'bold', color: '#FF5722' },
    payBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
});
