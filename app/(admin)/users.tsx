// Admin Users — light theme
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, ActionSheetIOS, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../services/api';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try { const r = await adminApi.getUsers(); if (r.success) setUsers(r.data); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { load(); }, []);
    const onRefresh = () => { setRefreshing(true); load(); };

    const handleAction = (user: any) => {
        const blockLabel = user.isBlocked ? 'Unblock User' : 'Block User';
        const opts = [blockLabel, 'Promote to Admin', 'Dismiss'];
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions({ options: opts, cancelButtonIndex: 2, destructiveButtonIndex: user.isBlocked ? -1 : 0 }, (i) => applyAction(i, user));
        } else {
            Alert.alert(user.name, 'Choose action', [
                { text: blockLabel, style: user.isBlocked ? 'default' : 'destructive', onPress: () => applyAction(0, user) },
                { text: 'Promote to Admin', onPress: () => applyAction(1, user) },
                { text: 'Dismiss', style: 'cancel' },
            ]);
        }
    };

    const applyAction = async (idx: number, user: any) => {
        if (idx === 0) {
            const r = await adminApi.toggleBlockUser(user._id);
            if (r.success) setUsers(p => p.map(u => u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u));
        } else if (idx === 1) {
            Alert.alert('Promote', `Promote ${user.name} to admin?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Promote', onPress: async () => {
                        const r = await adminApi.promoteToAdmin(user._id);
                        if (r.success) setUsers(p => p.map(u => u._id === user._id ? { ...u, role: 'admin' } : u));
                    }
                },
            ]);
        }
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const COLORS_LIST = ['#FF5722', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const accent = COLORS_LIST[index % COLORS_LIST.length];
        return (
            <View style={styles.card}>
                <View style={[styles.avatar, { backgroundColor: accent + '20' }]}>
                    <Text style={[styles.avatarText, { color: accent }]}>{getInitials(item.name)}</Text>
                </View>
                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{item.name}</Text>
                        {item.role === 'admin' && (
                            <View style={styles.adminBadge}>
                                <Text style={styles.adminBadgeText}>Admin</Text>
                            </View>
                        )}
                        {item.isBlocked && (
                            <View style={styles.blockedBadge}>
                                <Text style={styles.blockedBadgeText}>Blocked</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.phone}>{item.phone}</Text>
                    <Text style={styles.joined}>Joined {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                </View>
                <TouchableOpacity style={styles.menuBtn} onPress={() => handleAction(item)}>
                    <Ionicons name="ellipsis-vertical" size={18} color="#555" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.statsBar}>
                <Text style={styles.statsText}>{users.filter(u => u.role === 'user').length} Users · {users.filter(u => u.role === 'admin').length} Admins · {users.filter(u => u.isBlocked).length} Blocked</Text>
            </View>
            {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#FF5722" /> : (
                <FlatList data={users} keyExtractor={i => i._id} renderItem={renderItem} contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} />}
                    ListEmptyComponent={<Text style={styles.empty}>No users found.</Text>} />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    statsBar: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    statsText: { fontSize: 13, color: '#888', fontWeight: '500' },
    list: { padding: 16, gap: 10 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { fontSize: 16, fontWeight: 'bold' },
    info: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
    name: { fontSize: 15, fontWeight: '600', color: '#111' },
    adminBadge: { backgroundColor: '#3b82f615', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
    adminBadgeText: { fontSize: 10, color: '#3b82f6', fontWeight: '700' },
    blockedBadge: { backgroundColor: '#ef444415', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
    blockedBadgeText: { fontSize: 10, color: '#ef4444', fontWeight: '700' },
    phone: { fontSize: 13, color: '#666', marginBottom: 2 },
    joined: { fontSize: 11, color: '#aaa' },
    menuBtn: { padding: 6 },
    empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 14 },
});
