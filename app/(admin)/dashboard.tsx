// Admin Dashboard — light theme matching user section
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../services/api';

const STAT_CARDS = [
    { key: 'totalUsers', label: 'Total Users', icon: 'account-group', color: '#3b82f6' },
    { key: 'totalVenues', label: 'Active Venues', icon: 'stadium', color: '#10b981' },
    { key: 'totalBookings', label: 'Total Bookings', icon: 'calendar-check', color: '#8b5cf6' },
    { key: 'todayBookings', label: "Today's Bookings", icon: 'calendar-today', color: '#FF5722' },
    { key: 'pendingBookings', label: 'Pending', icon: 'clock-alert', color: '#f59e0b' },
    { key: 'totalRevenue', label: 'Revenue', icon: 'currency-inr', color: '#06b6d4' },
];

const STATUS_COLOR: Record<string, string> = {
    pending: '#f59e0b', approved: '#10b981', completed: '#3b82f6',
    cancelled: '#ef4444', rejected: '#6b7280',
};

const NAV_ITEMS = [
    { label: 'Venues', icon: 'business-outline', route: '/(admin)/venues', color: '#10b981' },
    { label: 'Slots', icon: 'time-outline', route: '/(admin)/slots', color: '#8b5cf6' },
    { label: 'Bookings', icon: 'calendar-outline', route: '/(admin)/bookings', color: '#FF5722' },
    { label: 'Users', icon: 'people-outline', route: '/(admin)/users', color: '#3b82f6' },
    { label: 'Notifs', icon: 'notifications-outline', route: '/(admin)/notifications', color: '#f59e0b' },
];

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [recent, setRecent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await adminApi.getDashboard();
            if (res.success) { setStats(res.data.stats); setRecent(res.data.recentBookings); }
        } finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { loadData(); }, []);

    if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#FF5722" /></View>;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#FF5722']} />}
            >
                {/* Quick Nav */}
                <View style={styles.quickNav}>
                    {NAV_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.label}
                            style={styles.navItem}
                            onPress={() => router.push(item.route as any)}
                        >
                            <View style={[styles.navIcon, { backgroundColor: item.color + '15' }]}>
                                <Ionicons name={item.icon as any} size={22} color={item.color} />
                            </View>
                            <Text style={styles.navLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Stats Grid */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                </View>
                <View style={styles.statsGrid}>
                    {STAT_CARDS.map((card) => (
                        <View key={card.key} style={styles.statCard}>
                            <View style={[styles.statIconWrap, { backgroundColor: card.color + '15' }]}>
                                <MaterialCommunityIcons name={card.icon as any} size={22} color={card.color} />
                            </View>
                            <Text style={styles.statValue}>
                                {card.key === 'totalRevenue'
                                    ? `₹${((stats)?.[card.key] || 0).toLocaleString('en-IN')}`
                                    : (stats)?.[card.key] ?? 0}
                            </Text>
                            <Text style={styles.statLabel}>{card.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Recent Bookings */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Bookings</Text>
                    <TouchableOpacity onPress={() => router.push('/(admin)/bookings' as any)}>
                        <Text style={styles.seeAll}>See all</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.listSection}>
                    {recent.length === 0 ? (
                        <Text style={styles.empty}>No bookings yet</Text>
                    ) : (
                        recent.map((b) => (
                            <TouchableOpacity key={b._id} style={styles.bookingCard} onPress={() => router.push('/(admin)/bookings' as any)}>
                                <View style={styles.bookingLeft}>
                                    <Text style={styles.bookingVenue} numberOfLines={1}>{b.venueName}</Text>
                                    <Text style={styles.bookingMeta}>{b.userName} · {b.date}</Text>
                                </View>
                                <View style={styles.bookingRight}>
                                    <Text style={styles.bookingAmount}>₹{b.totalAmount}</Text>
                                    <View style={[styles.badge, { backgroundColor: (STATUS_COLOR[b.status] || '#ccc') + '20' }]}>
                                        <Text style={[styles.badgeText, { color: STATUS_COLOR[b.status] || '#999' }]}>{b.status}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const S = {
    card: {
        backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    } as const,
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },

    // Quick Nav
    quickNav: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    navItem: { alignItems: 'center', gap: 6 },
    navIcon: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    navLabel: { fontSize: 11, color: '#555', fontWeight: '600' },

    // Section
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
    seeAll: { fontSize: 13, color: '#FF5722', fontWeight: '600' },

    // Stats
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
    statCard: { ...S.card, width: '47%', marginBottom: 0, alignItems: 'flex-start', gap: 6 },
    statIconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: 22, fontWeight: 'bold', color: '#111' },
    statLabel: { fontSize: 12, color: '#888' },

    // Bookings
    listSection: { paddingHorizontal: 16 },
    bookingCard: { ...S.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    bookingLeft: { flex: 1 },
    bookingVenue: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 3 },
    bookingMeta: { fontSize: 12, color: '#888' },
    bookingRight: { alignItems: 'flex-end', gap: 5 },
    bookingAmount: { fontSize: 14, fontWeight: 'bold', color: '#FF5722' },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    empty: { textAlign: 'center', color: '#999', padding: 24, fontSize: 14 },
});
