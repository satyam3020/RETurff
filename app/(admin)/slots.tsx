// Admin Slots — light theme (no external picker package)
import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, TextInput, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { adminApi } from '../../services/api';

export default function AdminSlots() {
    const [venues, setVenues] = useState<any[]>([]);
    const [selectedVenue, setSelectedVenue] = useState('');
    const [selectedVenueName, setSelectedVenueName] = useState('Select a venue');
    const [showVenuePicker, setShowVenuePicker] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [price, setPrice] = useState('500');
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [venuesLoaded, setVenuesLoaded] = useState(false);

    const loadVenues = useCallback(async () => {
        if (venuesLoaded) return;
        const r = await adminApi.getVenues();
        if (r.success && r.data.length) {
            setVenues(r.data);
            setSelectedVenue(r.data[0]._id);
            setSelectedVenueName(r.data[0].name);
        }
        setVenuesLoaded(true);
    }, [venuesLoaded]);

    React.useEffect(() => { loadVenues(); }, []);

    const pickVenue = (v: any) => {
        setSelectedVenue(v._id);
        setSelectedVenueName(v.name);
        setShowVenuePicker(false);
    };

    const loadSlots = async () => {
        if (!selectedVenue) { Alert.alert('Select Venue', 'Please choose a venue first.'); return; }
        setLoading(true);
        const r = await adminApi.getSlots(selectedVenue, date);
        if (r.success) setSlots(r.data);
        setLoading(false);
    };

    const bulkGenerate = async () => {
        if (!selectedVenue) { Alert.alert('Select Venue', 'Please select a venue.'); return; }
        setGenerating(true);
        const r = await adminApi.bulkGenerateSlots({ venueId: selectedVenue, date, price: Number(price) });
        if (r.success) { Alert.alert('✅ Done', r.message || 'Slots generated!'); await loadSlots(); }
        setGenerating(false);
    };

    const toggleBlock = async (slot: any) => {
        const r = await adminApi.toggleSlotBlock(slot._id);
        if (r.success) setSlots(p => p.map(s => s._id === slot._id ? { ...s, isBlocked: !s.isBlocked, isAvailable: s.isBlocked } : s));
    };

    const renderSlot = ({ item }: { item: any }) => (
        <View style={styles.slotCard}>
            <View style={styles.slotTime}>
                <Ionicons name="time-outline" size={16} color="#FF5722" />
                <Text style={styles.slotTimeText}>{item.startTime} – {item.endTime}</Text>
            </View>
            <Text style={styles.slotPrice}>₹{item.price}</Text>
            <View style={[styles.slotStatus, { backgroundColor: item.isBlocked ? '#ef444415' : item.isAvailable ? '#10b98115' : '#f59e0b15' }]}>
                <Text style={[styles.slotStatusText, { color: item.isBlocked ? '#ef4444' : item.isAvailable ? '#10b981' : '#f59e0b' }]}>
                    {item.isBlocked ? 'Blocked' : item.isAvailable ? 'Available' : 'Booked'}
                </Text>
            </View>
            <TouchableOpacity style={styles.slotToggle} onPress={() => toggleBlock(item)}>
                <Ionicons name={item.isBlocked ? 'lock-open-outline' : 'lock-closed-outline'} size={16} color={item.isBlocked ? '#10b981' : '#ef4444'} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Filter Panel */}
            <View style={styles.filterPanel}>
                <Text style={styles.filterLabel}>Venue</Text>
                <TouchableOpacity style={styles.venueSelector} onPress={() => setShowVenuePicker(true)}>
                    <Text style={styles.venueSelectorText} numberOfLines={1}>{selectedVenueName}</Text>
                    <Ionicons name="chevron-down" size={18} color="#888" />
                </TouchableOpacity>

                <View style={styles.filterRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.filterLabel}>Date</Text>
                        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="#bbb" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.filterLabel}>Price/hr (₹)</Text>
                        <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="500" placeholderTextColor="#bbb" />
                    </View>
                </View>

                <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.loadBtn} onPress={loadSlots}>
                        <Ionicons name="search-outline" size={16} color="#3b82f6" />
                        <Text style={styles.loadBtnText}>Load Slots</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.generateBtn} onPress={bulkGenerate} disabled={generating}>
                        <MaterialCommunityIcons name="auto-fix" size={16} color="#fff" />
                        <Text style={styles.generateBtnText}>{generating ? 'Generating...' : 'Bulk Generate'}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} color="#FF5722" />
            ) : (
                <FlatList
                    data={slots}
                    keyExtractor={i => i._id || i.id}
                    renderItem={renderSlot}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>Select a venue and date, then load or generate slots.</Text>}
                />
            )}

            {/* Venue Picker Bottom Sheet */}
            <Modal visible={showVenuePicker} animationType="slide" transparent>
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Select Venue</Text>
                            <TouchableOpacity onPress={() => setShowVenuePicker(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={22} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {venues.map(v => (
                                <TouchableOpacity
                                    key={v._id}
                                    style={[styles.pickerItem, selectedVenue === v._id && styles.pickerItemActive]}
                                    onPress={() => pickVenue(v)}
                                >
                                    <Text style={[styles.pickerItemText, selectedVenue === v._id && styles.pickerItemTextActive]}>
                                        {v.name}
                                    </Text>
                                    {selectedVenue === v._id && <Ionicons name="checkmark" size={18} color="#FF5722" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    filterPanel: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10 },
    filterLabel: { fontSize: 12, color: '#555', fontWeight: '500', marginBottom: 4 },

    // Custom venue selector
    venueSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 13, backgroundColor: '#fff' },
    venueSelectorText: { fontSize: 14, color: '#111', flex: 1 },

    filterRow: { flexDirection: 'row', gap: 10 },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, color: '#111', fontSize: 14, backgroundColor: '#fff' },
    btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
    loadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#3b82f6' },
    loadBtnText: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
    generateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 10, backgroundColor: '#FF5722' },
    generateBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },

    // Slot list
    list: { padding: 16 },
    slotCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
    slotTime: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 2 },
    slotTimeText: { fontSize: 13, color: '#333', fontWeight: '500' },
    slotPrice: { fontSize: 13, fontWeight: '600', color: '#FF5722', flex: 1, textAlign: 'center' },
    slotStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, flex: 2, alignItems: 'center' },
    slotStatusText: { fontSize: 11, fontWeight: '700' },
    slotToggle: { padding: 4 },
    empty: { textAlign: 'center', color: '#999', marginTop: 48, fontSize: 14, paddingHorizontal: 24 },

    // Bottom sheet picker
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    pickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    pickerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
    pickerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    pickerItemActive: { backgroundColor: '#FF572208' },
    pickerItemText: { fontSize: 15, color: '#333' },
    pickerItemTextActive: { fontWeight: '700', color: '#FF5722' },
});
