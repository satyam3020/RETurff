// Admin Support Requests — professional light theme matching admin panel
import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ActivityIndicator, Alert, Modal, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../services/api';

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_FILTERS = ['all', 'open', 'in-progress', 'resolved', 'closed'];

const STATUS_CONFIG: Record<string, { color: string; icon: string; bg: string }> = {
    'open': { color: '#f59e0b', icon: 'alert-circle', bg: '#fffbeb' },
    'in-progress': { color: '#3b82f6', icon: 'time', bg: '#eff6ff' },
    'resolved': { color: '#10b981', icon: 'checkmark-circle', bg: '#ecfdf5' },
    'closed': { color: '#6b7280', icon: 'close-circle', bg: '#f3f4f6' },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    bookings: { label: 'Bookings', icon: 'calendar-text', color: '#8b5cf6' },
    cancellations: { label: 'Cancellations', icon: 'calendar-sync', color: '#ef4444' },
    payments: { label: 'Payments', icon: 'cash-refund', color: '#06b6d4' },
    other: { label: 'Other', icon: 'message-text-outline', color: '#6b7280' },
};

export default function AdminSupportRequests() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    // Detail / update modal
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [updating, setUpdating] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await adminApi.getSupportRequests(activeFilter);
            if (res.success) setRequests(res.data);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeFilter]);

    useEffect(() => { setLoading(true); loadData(); }, [loadData]);

    const onRefresh = () => { setRefreshing(true); loadData(); };

    const openDetail = (item: any) => {
        setSelectedRequest(item);
        setNewStatus(item.status);
        setAdminNote(item.adminNote || '');
        setShowModal(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedRequest) return;
        setUpdating(true);
        try {
            const res = await adminApi.updateSupportRequest(selectedRequest._id, {
                status: newStatus,
                adminNote: adminNote.trim(),
            });
            if (res.success) {
                setShowModal(false);
                loadData();
                Alert.alert('Updated', 'Request status updated successfully.');
            } else {
                Alert.alert('Error', res.message || 'Failed to update.');
            }
        } catch {
            Alert.alert('Error', 'Something went wrong.');
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d ago`;
        return formatDate(dateStr);
    };

    // ── Render Card ──────────────────────────────────────────
    const renderItem = ({ item }: { item: any }) => {
        const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
        const catCfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => openDetail(item)}
                activeOpacity={0.7}
            >
                {/* Top row: category + status */}
                <View style={styles.cardTopRow}>
                    <View style={[styles.catPill, { backgroundColor: catCfg.color + '12' }]}>
                        <MaterialCommunityIcons name={catCfg.icon as any} size={13} color={catCfg.color} />
                        <Text style={[styles.catPillText, { color: catCfg.color }]}>{catCfg.label}</Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: statusCfg.color + '18' }]}>
                        <View style={[styles.dotInner, { backgroundColor: statusCfg.color }]} />
                        <Text style={[styles.statusDotText, { color: statusCfg.color }]}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                </View>

                {/* Subject */}
                <Text style={styles.cardSubject} numberOfLines={1}>{item.subject}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

                {/* Footer: user + time */}
                <View style={styles.cardDivider} />
                <View style={styles.cardFooter}>
                    <View style={styles.userChip}>
                        <View style={[styles.avatarSmall, { backgroundColor: catCfg.color + '18' }]}>
                            <Text style={[styles.avatarSmallText, { color: catCfg.color }]}>
                                {item.userName?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.chipName}>{item.userName}</Text>
                            <Text style={styles.chipPhone}>{item.userPhone}</Text>
                        </View>
                    </View>
                    <Text style={styles.timeAgo}>{getTimeAgo(item.createdAt)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // ── Counts ───────────────────────────────────────────────
    const openCount = requests.filter(r => r.status === 'open').length;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>

            {/* ── Summary bar ─────────────────────────────────── */}
            {!loading && requests.length > 0 && (
                <View style={styles.summaryBar}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{requests.length}</Text>
                        <Text style={styles.summaryLabel}>Total</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>{openCount}</Text>
                        <Text style={styles.summaryLabel}>Open</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryValue, { color: '#10b981' }]}>
                            {requests.filter(r => r.status === 'resolved').length}
                        </Text>
                        <Text style={styles.summaryLabel}>Resolved</Text>
                    </View>
                </View>
            )}

            {/* ── Filter chips ────────────────────────────────── */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
            >
                {STATUS_FILTERS.map((f) => {
                    const active = activeFilter === f;
                    return (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, active && styles.filterChipActive]}
                            onPress={() => setActiveFilter(f)}
                            activeOpacity={0.75}
                        >
                            <Text style={[styles.filterText, active && styles.filterTextActive]}>
                                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* ── List ────────────────────────────────────────── */}
            {loading ? (
                <View style={styles.loaderWrap}>
                    <ActivityIndicator size="large" color="#FF5722" />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(i) => i._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="chatbox-outline" size={36} color="#ccc" />
                            </View>
                            <Text style={styles.emptyTitle}>No Requests</Text>
                            <Text style={styles.emptySubtitle}>
                                {activeFilter === 'all'
                                    ? 'No support requests have been submitted yet.'
                                    : `No ${activeFilter} requests found.`}
                            </Text>
                        </View>
                    }
                />
            )}

            {/* ── Detail Modal ────────────────────────────────── */}
            <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={styles.modalContainer}>
                    {/* Modal header */}
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={styles.modalTitle}>Request Details</Text>
                            <Text style={styles.modalSubtitle}>
                                #{selectedRequest?._id?.slice(-6)?.toUpperCase()}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowModal(false)}
                            style={styles.modalCloseBtn}
                        >
                            <Ionicons name="close" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {selectedRequest && (
                            <>
                                {/* User card */}
                                <View style={styles.detailCard}>
                                    <Text style={styles.detailSectionLabel}>SUBMITTED BY</Text>
                                    <View style={styles.detailUserRow}>
                                        <View style={styles.detailAvatar}>
                                            <Text style={styles.detailAvatarText}>
                                                {selectedRequest.userName?.charAt(0)?.toUpperCase() || 'U'}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.detailUserName}>{selectedRequest.userName}</Text>
                                            <Text style={styles.detailUserPhone}>{selectedRequest.userPhone}</Text>
                                        </View>
                                        <Text style={styles.detailTime}>{formatDate(selectedRequest.createdAt)}</Text>
                                    </View>
                                </View>

                                {/* Request info card */}
                                <View style={styles.detailCard}>
                                    <View style={styles.detailInfoRow}>
                                        <View style={styles.detailInfoItem}>
                                            <Text style={styles.detailSectionLabel}>CATEGORY</Text>
                                            <View style={[styles.detailInfoBadge, { backgroundColor: (CATEGORY_CONFIG[selectedRequest.category]?.color || '#666') + '12' }]}>
                                                <MaterialCommunityIcons
                                                    name={(CATEGORY_CONFIG[selectedRequest.category]?.icon || 'help-circle') as any}
                                                    size={14}
                                                    color={CATEGORY_CONFIG[selectedRequest.category]?.color || '#666'}
                                                />
                                                <Text style={[styles.detailInfoBadgeText, { color: CATEGORY_CONFIG[selectedRequest.category]?.color || '#666' }]}>
                                                    {CATEGORY_CONFIG[selectedRequest.category]?.label || selectedRequest.category}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.detailInfoItem}>
                                            <Text style={styles.detailSectionLabel}>CURRENT STATUS</Text>
                                            <View style={[styles.detailInfoBadge, { backgroundColor: (STATUS_CONFIG[selectedRequest.status]?.color || '#666') + '12' }]}>
                                                <View style={[styles.dotInner, { backgroundColor: STATUS_CONFIG[selectedRequest.status]?.color || '#666', width: 7, height: 7, borderRadius: 4 }]} />
                                                <Text style={[styles.detailInfoBadgeText, { color: STATUS_CONFIG[selectedRequest.status]?.color || '#666' }]}>
                                                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Subject & Description */}
                                <View style={styles.detailCard}>
                                    <Text style={styles.detailSectionLabel}>SUBJECT</Text>
                                    <Text style={styles.detailSubject}>{selectedRequest.subject}</Text>
                                    <View style={styles.detailDivider} />
                                    <Text style={styles.detailSectionLabel}>DESCRIPTION</Text>
                                    <Text style={styles.detailDescription}>{selectedRequest.description}</Text>
                                </View>

                                {/* ── Admin Actions ───────────────────────────── */}
                                <View style={styles.actionsCard}>
                                    <Text style={styles.actionsTitle}>Update Request</Text>

                                    {/* Status selector */}
                                    <Text style={styles.actionLabel}>Status</Text>
                                    <View style={styles.statusGrid}>
                                        {(['open', 'in-progress', 'resolved', 'closed'] as const).map((s) => {
                                            const cfg = STATUS_CONFIG[s];
                                            const active = newStatus === s;
                                            return (
                                                <TouchableOpacity
                                                    key={s}
                                                    style={[
                                                        styles.statusChip,
                                                        active && { borderColor: cfg.color, backgroundColor: cfg.bg },
                                                    ]}
                                                    onPress={() => setNewStatus(s)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons
                                                        name={cfg.icon as any}
                                                        size={15}
                                                        color={active ? cfg.color : '#bbb'}
                                                    />
                                                    <Text style={[
                                                        styles.statusChipText,
                                                        active && { color: cfg.color, fontWeight: '700' },
                                                    ]}>
                                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    {/* Admin note */}
                                    <Text style={[styles.actionLabel, { marginTop: 16 }]}>Admin Note</Text>
                                    <TextInput
                                        style={styles.noteInput}
                                        value={adminNote}
                                        onChangeText={setAdminNote}
                                        placeholder="Add an internal note..."
                                        placeholderTextColor="#c0c0c0"
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                    />

                                    {/* Save */}
                                    <TouchableOpacity
                                        style={[styles.saveBtn, updating && { opacity: 0.6 }]}
                                        onPress={handleUpdateStatus}
                                        disabled={updating}
                                        activeOpacity={0.8}
                                    >
                                        {updating ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <>
                                                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                                                <Text style={styles.saveBtnText}>Save Changes</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },

    // Summary bar
    summaryBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12,
        borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryValue: { fontSize: 22, fontWeight: '800', color: '#111' },
    summaryLabel: { fontSize: 11, color: '#999', fontWeight: '500', marginTop: 2 },
    summaryDivider: { width: 1, height: 32, backgroundColor: '#f0f0f0' },

    // Filter chips
    filterScroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, gap: 8 },
    filterChip: {
        height: 34,
        paddingHorizontal: 18,
        borderRadius: 17,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e8e8e8',
    },
    filterChipActive: {
        backgroundColor: '#FF5722',
        borderColor: '#FF5722',
    },
    filterText: { fontSize: 13, fontWeight: '600', color: '#888' },
    filterTextActive: { color: '#fff' },

    // List
    list: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 32 },
    loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    cardTopRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
    },
    catPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    catPillText: { fontSize: 11, fontWeight: '700' },
    statusDot: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    dotInner: { width: 6, height: 6, borderRadius: 3 },
    statusDotText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },

    cardSubject: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 3 },
    cardDesc: { fontSize: 13, color: '#888', lineHeight: 18, marginBottom: 0 },

    cardDivider: { height: 1, backgroundColor: '#f5f5f5', marginVertical: 12 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    userChip: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    avatarSmall: {
        width: 30, height: 30, borderRadius: 15,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarSmallText: { fontSize: 12, fontWeight: '800' },
    chipName: { fontSize: 13, fontWeight: '600', color: '#333' },
    chipPhone: { fontSize: 11, color: '#aaa' },
    timeAgo: { fontSize: 11, color: '#bbb', fontWeight: '500' },

    // Empty
    emptyWrap: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40, gap: 8 },
    emptyIcon: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: '#f5f5f5',
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
    emptySubtitle: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 18 },

    // ── Modal ───────────────────────────────────
    modalContainer: { flex: 1, backgroundColor: '#F5F5F5' },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
    modalSubtitle: { fontSize: 12, color: '#aaa', fontWeight: '500', marginTop: 2 },
    modalCloseBtn: {
        width: 34, height: 34, borderRadius: 17, backgroundColor: '#f5f5f5',
        justifyContent: 'center', alignItems: 'center',
    },
    modalBody: { padding: 16, gap: 12, paddingBottom: 40 },

    // Detail cards
    detailCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    detailSectionLabel: {
        fontSize: 10, fontWeight: '700', color: '#b0b0b0',
        letterSpacing: 1, marginBottom: 8,
    },
    detailUserRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    detailAvatar: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF572212',
        justifyContent: 'center', alignItems: 'center',
    },
    detailAvatarText: { fontSize: 17, fontWeight: '800', color: '#FF5722' },
    detailUserName: { fontSize: 15, fontWeight: '700', color: '#111' },
    detailUserPhone: { fontSize: 12, color: '#999', marginTop: 1 },
    detailTime: { fontSize: 11, color: '#bbb', fontWeight: '500' },

    detailInfoRow: { flexDirection: 'row', gap: 16 },
    detailInfoItem: { flex: 1 },
    detailInfoBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
        alignSelf: 'flex-start',
    },
    detailInfoBadgeText: { fontSize: 12, fontWeight: '700' },

    detailSubject: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
    detailDivider: { height: 1, backgroundColor: '#f5f5f5', marginVertical: 12 },
    detailDescription: { fontSize: 14, color: '#555', lineHeight: 21, fontWeight: '400' },

    // Actions card
    actionsCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
        borderWidth: 1, borderColor: '#FF572215',
    },
    actionsTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 16 },
    actionLabel: { fontSize: 12, fontWeight: '600', color: '#777', marginBottom: 8 },

    statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statusChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
        borderWidth: 1.5, borderColor: '#e8e8e8', backgroundColor: '#fafafa',
    },
    statusChipText: { fontSize: 12, fontWeight: '600', color: '#aaa' },

    noteInput: {
        backgroundColor: '#fafafa', borderRadius: 12, padding: 14,
        color: '#111', fontSize: 14, borderWidth: 1, borderColor: '#e8e8e8',
        height: 80, textAlignVertical: 'top',
    },

    saveBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#FF5722', padding: 16, borderRadius: 12, marginTop: 16,
    },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
