// Your Bookings Screen - Shows user's booked turfs
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/theme';

// Mock booking data - will be replaced with actual API data
const MOCK_BOOKINGS = [
    {
        id: '1',
        venueName: 'Pitchnova Sports Arena',
        location: 'Bhayandar West, Mumbai',
        date: '18 Feb 2026',
        time: '6:00 - 7:00 AM',
        sport: 'Pickleball',
        court: 'Full Court',
        price: 200,
        status: 'upcoming', // upcoming, completed, cancelled
        image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400',
    },
    {
        id: '2',
        venueName: 'Nine Star Turf',
        location: 'Andheri West, Mumbai',
        date: '20 Feb 2026',
        time: '7:00 - 8:00 PM',
        sport: 'Football',
        court: 'Full Ground',
        price: 500,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400',
    },
];

export default function BookingsScreen() {
    const upcomingBookings = MOCK_BOOKINGS.filter(b => b.status === 'upcoming');
    const pastBookings = MOCK_BOOKINGS.filter(b => b.status === 'completed');

    const renderBookingCard = (booking: typeof MOCK_BOOKINGS[0]) => (
        <TouchableOpacity key={booking.id} style={styles.bookingCard}>
            <Image source={{ uri: booking.image }} style={styles.bookingImage} />

            <View style={styles.bookingContent}>
                <View style={styles.bookingHeader}>
                    <Text style={styles.venueName}>{booking.venueName}</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>
                            {booking.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                        </Text>
                    </View>
                </View>

                <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#666" />
                    <Text style={styles.locationText}>{booking.location}</Text>
                </View>

                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="calendar" size={16} color="#FF5722" />
                        <Text style={styles.detailText}>{booking.date}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#FF5722" />
                        <Text style={styles.detailText}>{booking.time}</Text>
                    </View>
                </View>

                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="tennis" size={16} color="#4CAF50" />
                        <Text style={styles.detailText}>{booking.sport}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="stadium" size={16} color="#4CAF50" />
                        <Text style={styles.detailText}>{booking.court}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.price}>₹{booking.price}</Text>
                    <TouchableOpacity style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>View Details</Text>
                        <Ionicons name="chevron-forward" size={16} color="#FF5722" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Bookings</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {upcomingBookings.length === 0 && pastBookings.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="calendar-blank" size={80} color="#E0E0E0" />
                        <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                        <Text style={styles.emptyText}>
                            Book your first turf and start playing!
                        </Text>
                    </View>
                ) : (
                    <>
                        {upcomingBookings.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
                                {upcomingBookings.map(renderBookingCard)}
                            </View>
                        )}

                        {pastBookings.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Past Bookings</Text>
                                {pastBookings.map(renderBookingCard)}
                            </View>
                        )}
                    </>
                )}

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
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
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
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
        height: 120,
        resizeMode: 'cover',
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
    },
    statusBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4CAF50',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: SPACING.sm,
    },
    locationText: {
        fontSize: 13,
        color: '#666',
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
