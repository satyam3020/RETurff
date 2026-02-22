// Admin Venues — light theme matching user section
import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ActivityIndicator, Alert, TextInput, ScrollView, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../../services/api';

const BLANK = { name: '', 'location.address': '', pricePerHour: '', description: '', sports: '', amenities: '' };

export default function AdminVenues() {
    const [venues, setVenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<any>(BLANK);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try { const r = await adminApi.getVenues(); if (r.success) setVenues(r.data); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { load(); }, []);
    const onRefresh = () => { setRefreshing(true); load(); };

    const openEdit = (v: any) => {
        setEditId(v._id);
        setForm({ name: v.name, 'location.address': v.location?.address || '', pricePerHour: String(v.pricePerHour), description: v.description || '', sports: v.sports?.map((s: any) => s.name).join(', ') || '', amenities: v.amenities?.join(', ') || '' });
        setShowModal(true);
    };
    const openAdd = () => { setEditId(null); setForm(BLANK); setShowModal(true); };

    const handleSave = async () => {
        if (!form.name || !form['location.address'] || !form.pricePerHour) { Alert.alert('Required', 'Name, address and price are required'); return; }
        setSaving(true);
        try {
            const payload = { name: form.name, location: { address: form['location.address'] }, pricePerHour: Number(form.pricePerHour), description: form.description, sports: form.sports.split(',').map((s: string) => ({ name: s.trim() })).filter((s: any) => s.name), amenities: form.amenities.split(',').map((s: string) => s.trim()).filter(Boolean) };
            const r = editId ? await adminApi.updateVenue(editId, payload) : await adminApi.createVenue(payload);
            if (r.success) { setShowModal(false); load(); Alert.alert('✅ Success', `Venue ${editId ? 'updated' : 'created'}`); }
        } finally { setSaving(false); }
    };

    const handleDelete = (id: string, name: string) =>
        Alert.alert('Delete', `Delete "${name}"?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await adminApi.deleteVenue(id); setVenues(p => p.filter(v => v._id !== id)); } }]);

    const handleToggle = async (id: string) => {
        const r = await adminApi.toggleVenueActive(id);
        if (r.success) setVenues(p => p.map(v => v._id === id ? { ...v, isActive: !v.isActive } : v));
    };

    const Field = ({ label, field, kbType }: any) => (
        <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput style={styles.input} value={form[field]} onChangeText={(v) => setForm((p: any) => ({ ...p, [field]: v }))} placeholder={label} placeholderTextColor="#bbb" keyboardType={kbType || 'default'} />
        </View>
    );

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardRow}>
                <View style={styles.cardInfo}>
                    <Text style={styles.venueName}>{item.name}</Text>
                    <Text style={styles.venueAddr} numberOfLines={1}>{item.location?.address}</Text>
                    <Text style={styles.venuePrice}>₹{item.pricePerHour}/hr</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.isActive ? '#10b98115' : '#ef444415' }]}>
                    <Text style={[styles.statusText, { color: item.isActive ? '#10b981' : '#ef4444' }]}>{item.isActive ? 'Active' : 'Inactive'}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggle(item._id)}>
                    <Ionicons name={item.isActive ? 'eye-off-outline' : 'eye-outline'} size={16} color="#f59e0b" />
                    <Text style={[styles.actionText, { color: '#f59e0b' }]}>{item.isActive ? 'Deactivate' : 'Activate'}</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
                    <Ionicons name="create-outline" size={16} color="#3b82f6" />
                    <Text style={[styles.actionText, { color: '#3b82f6' }]}>Edit</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id, item.name)}>
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.addBtnText}>Add New Venue</Text>
            </TouchableOpacity>

            {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#FF5722" /> : (
                <FlatList data={venues} keyExtractor={i => i._id} renderItem={renderItem} contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} />}
                    ListEmptyComponent={<Text style={styles.empty}>No venues yet. Add one!</Text>} />
            )}

            <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editId ? 'Edit Venue' : 'Add Venue'}</Text>
                        <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={22} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
                        <Field label="Venue Name *" field="name" />
                        <Field label="Address *" field="location.address" />
                        <Field label="Price per Hour (₹) *" field="pricePerHour" kbType="numeric" />
                        <Field label="Description" field="description" />
                        <Field label="Sports (comma separated)" field="sports" />
                        <Field label="Amenities (comma separated)" field="amenities" />
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : editId ? 'Update Venue' : 'Create Venue'}</Text>
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
    card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
    cardInfo: { flex: 1 },
    venueName: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 4 },
    venueAddr: { fontSize: 13, color: '#888', marginBottom: 4 },
    venuePrice: { fontSize: 13, color: '#FF5722', fontWeight: '600' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' },
    statusText: { fontSize: 11, fontWeight: '700' },
    actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 4 },
    divider: { width: 1, backgroundColor: '#f0f0f0' },
    actionText: { fontSize: 12, fontWeight: '600' },
    empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 14 },
    modal: { flex: 1, backgroundColor: '#F5F5F5' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
    closeBtn: { padding: 4 },
    fieldGroup: { gap: 6 },
    fieldLabel: { fontSize: 13, color: '#555', fontWeight: '500' },
    input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, color: '#111', fontSize: 14, borderWidth: 1, borderColor: '#e5e7eb' },
    saveBtn: { backgroundColor: '#FF5722', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
