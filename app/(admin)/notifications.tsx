// Admin Notifications — light theme
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../services/api';

const TYPE_ICONS: Record<string, { name: any; color: string }> = {
    info: { name: 'information-circle', color: '#3b82f6' },
    promo: { name: 'gift', color: '#f59e0b' },
    warning: { name: 'alert-circle', color: '#ef4444' },
    success: { name: 'checkmark-circle', color: '#10b981' },
};

const BLANK = { title: '', message: '', type: 'info', isGlobal: true };

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<any>(BLANK);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try { const r = await adminApi.getNotifications(); if (r.success) setNotifications(r.data); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { load(); }, []);
    const onRefresh = () => { setRefreshing(true); load(); };

    const handleCreate = async () => {
        if (!form.title || !form.message) { Alert.alert('Required', 'Title and message are required.'); return; }
        setSaving(true);
        const r = await adminApi.createNotification(form);
        if (r.success) { setShowModal(false); setForm(BLANK); load(); }
        setSaving(false);
    };

    const handleDelete = (id: string) =>
        Alert.alert('Delete', 'Delete this notification?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    await adminApi.deleteNotification(id);
                    setNotifications(p => p.filter(n => n._id !== id));
                }
            },
        ]);

    const TYPE_OPTIONS = ['info', 'promo', 'warning', 'success'];

    const renderItem = ({ item }: { item: any }) => {
        const icon = TYPE_ICONS[item.type] || TYPE_ICONS.info;
        const timeStr = new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        return (
            <View style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: icon.color + '15' }]}>
                    <Ionicons name={icon.name} size={22} color={icon.color} />
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardTop}>
                        <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.notifTime}>{timeStr}</Text>
                    </View>
                    <Text style={styles.notifMsg} numberOfLines={2}>{item.message}</Text>
                    <View style={styles.cardMeta}>
                        <View style={[styles.typeBadge, { backgroundColor: icon.color + '15' }]}>
                            <Text style={[styles.typeBadgeText, { color: icon.color }]}>{item.type}</Text>
                        </View>
                        <Text style={styles.audience}>{item.isGlobal ? '🌍 All Users' : '👤 Targeted'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.addBtnText}>Send Notification</Text>
            </TouchableOpacity>

            {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#FF5722" /> : (
                <FlatList data={notifications} keyExtractor={i => i._id} renderItem={renderItem} contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} />}
                    ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>} />
            )}

            <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Send Notification</Text>
                        <TouchableOpacity onPress={() => setShowModal(false)} style={{ padding: 4 }}>
                            <Ionicons name="close" size={22} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
                        {/* Title */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Title *</Text>
                            <TextInput style={styles.input} value={form.title} onChangeText={v => setForm((p: any) => ({ ...p, title: v }))} placeholder="Notification title" placeholderTextColor="#bbb" />
                        </View>
                        {/* Message */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Message *</Text>
                            <TextInput style={[styles.input, styles.textArea]} value={form.message} onChangeText={v => setForm((p: any) => ({ ...p, message: v }))} placeholder="Notification message..." placeholderTextColor="#bbb" multiline numberOfLines={4} />
                        </View>
                        {/* Type */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Type</Text>
                            <View style={styles.typeRow}>
                                {TYPE_OPTIONS.map(t => {
                                    const ic = TYPE_ICONS[t];
                                    const active = form.type === t;
                                    return (
                                        <TouchableOpacity key={t} style={[styles.typeOption, active && { borderColor: ic.color, backgroundColor: ic.color + '10' }]} onPress={() => setForm((p: any) => ({ ...p, type: t }))}>
                                            <Ionicons name={ic.name} size={18} color={active ? ic.color : '#aaa'} />
                                            <Text style={[styles.typeOptionText, active && { color: ic.color }]}>{t}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                        {/* Audience */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Audience</Text>
                            <View style={styles.typeRow}>
                                {[{ val: true, label: '🌍 All Users' }, { val: false, label: '👤 Specific User' }].map(o => (
                                    <TouchableOpacity key={String(o.val)} style={[styles.typeOption, { flex: 1 }, form.isGlobal === o.val && { borderColor: '#FF5722', backgroundColor: '#FF572210' }]} onPress={() => setForm((p: any) => ({ ...p, isGlobal: o.val }))}>
                                        <Text style={[styles.typeOptionText, form.isGlobal === o.val && { color: '#FF5722', fontWeight: '700' }]}>{o.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity style={styles.sendBtn} onPress={handleCreate} disabled={saving}>
                            <Text style={styles.sendBtnText}>{saving ? 'Sending...' : 'Send Notification'}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FF5722', margin: 16, padding: 14, borderRadius: 12, justifyContent: 'center' },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    list: { paddingHorizontal: 16, paddingBottom: 32 },
    card: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    iconBox: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    cardContent: { flex: 1 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    notifTitle: { fontSize: 14, fontWeight: '700', color: '#111', flex: 1, marginRight: 8 },
    notifTime: { fontSize: 11, color: '#aaa' },
    notifMsg: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 8 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    typeBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
    audience: { fontSize: 11, color: '#888' },
    deleteBtn: { padding: 6, marginLeft: 4 },
    empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 14 },
    // Modal
    modal: { flex: 1, backgroundColor: '#F5F5F5' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
    field: { gap: 6 },
    label: { fontSize: 13, color: '#555', fontWeight: '500' },
    input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, color: '#111', fontSize: 14, borderWidth: 1, borderColor: '#e5e7eb' },
    textArea: { height: 100, textAlignVertical: 'top' },
    typeRow: { flexDirection: 'row', gap: 8 },
    typeOption: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#e5e7eb', gap: 4 },
    typeOptionText: { fontSize: 12, color: '#aaa', fontWeight: '600', textTransform: 'capitalize' },
    sendBtn: { backgroundColor: '#FF5722', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    sendBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
