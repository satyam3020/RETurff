// Admin Bookings — light theme
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, ActionSheetIOS, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { adminApi } from '../../services/api';

const STATUS_TABS = ['all', 'pending', 'approved', 'completed', 'cancelled'];
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#fef3c7', text: '#d97706' },
    approved: { bg: '#d1fae5', text: '#059669' },
    completed: { bg: '#dbeafe', text: '#2563eb' },
    cancelled: { bg: '#fee2e2', text: '#dc2626' },
    rejected: { bg: '#f3f4f6', text: '#6b7280' },
};

const ACTIONS = ['Approve', 'Reject', 'Mark Completed', 'Confirm Payment', 'Cancel', 'Dismiss'];

export default function AdminBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (status?: string) => {
        try {
            const r = await adminApi.getBookings(status && status !== 'all' ? status : undefined);
            if (r.success) setBookings(r.data);
        } finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { load(activeTab); }, [activeTab]);

    // Also refresh whenever admin navigates back to this screen
    // so newly created user bookings are visible immediately
    useFocusEffect(
        useCallback(() => { load(activeTab); }, [activeTab])
    );

    const onTabChange = (tab: string) => { setActiveTab(tab); setLoading(true); };
    const onRefresh = () => { setRefreshing(true); load(activeTab); };

    const handleAction = (booking: any) => {
        const options = [...ACTIONS];
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions({ options, cancelButtonIndex: 5, destructiveButtonIndex: 4 }, (i) => applyAction(i, booking));
        } else {
            Alert.alert(booking.venueName, 'Choose action', [
                { text: 'Approve', onPress: () => applyAction(0, booking) },
                { text: 'Reject', onPress: () => applyAction(1, booking) },
                { text: 'Mark Completed', onPress: () => applyAction(2, booking) },
                { text: 'Confirm Payment', onPress: () => applyAction(3, booking) },
                { text: 'Cancel', style: 'destructive', onPress: () => applyAction(4, booking) },
                { text: 'Dismiss', style: 'cancel' },
            ]);
        }
    };

    const applyAction = async (idx: number, booking: any) => {
        const map: Record<number, any> = {
            0: { status: 'approved' },
            1: { status: 'rejected' },
            2: { status: 'completed' },
            3: { paymentStatus: 'paid' },
            4: { status: 'cancelled' },
        };
        if (!map[idx]) return;
        await adminApi.updateBookingStatus(booking._id, map[idx]);
        load(activeTab);
    };

    const handlePaymentDone = (booking: any) => {
        Alert.alert(
            'Confirm Payment',
            `Mark payment of ₹${booking.totalAmount} as received from ${booking.userName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Payment Done',
                    onPress: async () => {
                        await adminApi.updateBookingStatus(booking._id, { paymentStatus: 'paid' });
                        load(activeTab);
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const sc = STATUS_COLORS[item.status] || { bg: '#f3f4f6', text: '#555' };
        const isPaid = item.paymentStatus === 'paid';
        return (
            <View style={styles.card}>
                <View style={styles.cardTop}>
                    <View style={styles.cardInfo}>
                        <Text style={styles.venue} numberOfLines={1}>{item.venueName}</Text>
                        <Text style={styles.meta}>{item.userName} · {item.sport}</Text>
                        <Text style={styles.meta}>{item.date} · {item.startTime}</Text>
                    </View>
                    <View>
                        <Text style={styles.amount}>₹{item.totalAmount}</Text>
                        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                            <Text style={[styles.badgeText, { color: sc.text }]}>{item.status}</Text>
                        </View>
                    </View>
                </View>
                {/* Payment Done Button or Confirmed Badge */}
                <View style={styles.paymentRow}>
                    {isPaid ? (
                        <View style={styles.paymentDoneBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#059669" />
                            <Text style={styles.paymentDoneText}>Payment Done ✓</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.paymentDoneBtn} onPress={() => handlePaymentDone(item)}>
                            <Ionicons name="cash-outline" size={16} color="#fff" />
                            <Text style={styles.paymentDoneBtnText}>💰 Payment Done</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.cardActions}>
                    <Text style={styles.phone}>{item.userPhone}</Text>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(item)}>
                        <Ionicons name="ellipsis-horizontal" size={14} color="#555" />
                        <Text style={styles.actionText}>Actions</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.tabs}>
                <FlatList horizontal data={STATUS_TABS} keyExtractor={i => i} showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={[styles.tab, activeTab === item && styles.tabActive]} onPress={() => onTabChange(item)}>
                            <Text style={[styles.tabText, activeTab === item && styles.tabTextActive]}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
                        </TouchableOpacity>
                    )} />
            </View>
            {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#FF5722" /> : (
                <FlatList data={bookings} keyExtractor={i => i._id} renderItem={renderItem} contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} />}
                    ListEmptyComponent={<Text style={styles.empty}>No bookings found.</Text>} />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    tabs: { paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6' },
    tabActive: { backgroundColor: '#FF5722' },
    tabText: { fontSize: 13, color: '#555', fontWeight: '500' },
    tabTextActive: { color: '#fff', fontWeight: '700' },
    list: { padding: 16, gap: 10 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    cardInfo: { flex: 1, marginRight: 12 },
    venue: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 3 },
    meta: { fontSize: 12, color: '#888', marginBottom: 2 },
    amount: { fontSize: 15, fontWeight: 'bold', color: '#FF5722', textAlign: 'right', marginBottom: 5 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-end' },
    badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
    cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
    paymentRow: { marginBottom: 8 },
    paymentDoneBtn: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6,
        backgroundColor: '#FF9800', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    },
    paymentDoneBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    paymentDoneBadge: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6,
        backgroundColor: '#d1fae5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    },
    paymentDoneText: { color: '#059669', fontSize: 12, fontWeight: '700' },
    phone: { fontSize: 12, color: '#888' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    actionText: { fontSize: 12, fontWeight: '600', color: '#555' },
    empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 14 },
});
