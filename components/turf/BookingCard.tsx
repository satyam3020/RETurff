// Booking card for My Bookings list
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../utils/theme';
import { formatPrice } from '../../utils/validators';
import Card from '../ui/Card';
import type { Booking, BookingStatus } from '../../types';

interface BookingCardProps {
    booking: Booking;
}

const STATUS_CONFIG: Record<BookingStatus, { color: string; label: string }> = {
    upcoming: { color: COLORS.upcoming || '#4CAF50', label: 'Upcoming ✅' },
    completed: { color: COLORS.completed || '#2196F3', label: 'Completed' },
    cancelled: { color: COLORS.cancelled || '#9E9E9E', label: 'Cancelled' },
    payment_pending: { color: '#FF9800', label: 'Payment Pending ⏳' },
    pending: { color: '#FF9800', label: 'Pending' },
    approved: { color: '#4CAF50', label: 'Approved ✅' },
    rejected: { color: '#F44336', label: 'Rejected' },
};

export default function BookingCard({ booking }: BookingCardProps) {
    const statusConfig = STATUS_CONFIG[booking.status] || { color: '#999', label: booking.status };

    return (
        <Card style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.turfName} numberOfLines={1}>
                    {booking.turfName}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
                    <Text style={styles.statusText}>{statusConfig.label}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.infoText}>{booking.date}</Text>
            </View>

            <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>⏰</Text>
                <Text style={styles.infoText}>
                    {booking.startTime} - {booking.endTime} ({booking.duration}h)
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.priceLabel}>Total</Text>
                <Text style={styles.price}>{formatPrice(booking.totalPrice)}</Text>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    turfName: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
        flex: 1,
        marginRight: SPACING.sm,
    },
    statusBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs / 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    statusText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.white,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    infoIcon: {
        fontSize: 16,
        marginRight: SPACING.sm,
    },
    infoText: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
        paddingTop: SPACING.md,
        marginTop: SPACING.sm,
    },
    priceLabel: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
    },
    price: {
        ...TYPOGRAPHY.h3,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});
