// Admin Slots — fully wired to real backend via adminApi
import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, TextInput, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { adminApi } from '../../services/api';

// ─── Fixed sport / pitch options ─────────────────────────────────────────────
const SPORTS = [
    { id: 's1', name: 'Cricket', icon: 'cricket' },
    { id: 's2', name: 'Football', icon: 'soccer' },
];
const PITCHES = ['Pitch 1', 'Pitch 2'];

interface Slot {
    _id: string;
    venueId: string;
    date: string;
    sport: string;
    surface: string;
    startTime: string;
    endTime: string;
    price: number;
    isAvailable: boolean;
    isBooked: boolean;
    isBlocked: boolean;
}

interface Venue {
    _id: string;
    name: string;
}

export default function AdminSlots() {
    // Venues
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenue, setSelectedVenue] = useState('');
    const [selectedVenueName, setSelectedVenueName] = useState('Loading...');
    const [showVenuePicker, setShowVenuePicker] = useState(false);
    const [venuesLoading, setVenuesLoading] = useState(true);

    // Sport
    const [selectedSport, setSelectedSport] = useState(SPORTS[0]);
    const [showSportPicker, setShowSportPicker] = useState(false);

    // Pitch
    const [selectedPitch, setSelectedPitch] = useState(PITCHES[0]);
    const [showPitchPicker, setShowPitchPicker] = useState(false);

    // Date / Price / UI state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [price, setPrice] = useState('200');
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    // ── Fetch real venues on mount ────────────────────────────────────────────
    useEffect(() => {
        const fetchVenues = async () => {
            setVenuesLoading(true);
            try {
                const res = await adminApi.getVenues();
                if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                    setVenues(res.data);
                    setSelectedVenue(res.data[0]._id);
                    setSelectedVenueName(res.data[0].name);
                } else {
                    Alert.alert('No Venues', 'No venues found. Please create a venue first.');
                }
            } catch {
                Alert.alert('Error', 'Failed to load venues. Check your network.');
            } finally {
                setVenuesLoading(false);
            }
        };
        fetchVenues();
    }, []);

    // ── Load slots from backend ───────────────────────────────────────────────
    const loadSlots = useCallback(async () => {
        if (!selectedVenue) { Alert.alert('Select Venue', 'Please select a venue first.'); return; }
        setLoading(true);
        try {
            const res = await adminApi.getSlots(selectedVenue, date);
            if (res.success && Array.isArray(res.data)) {
                // Filter by selected sport + pitch on frontend
                const filtered = res.data.filter((s: Slot) => {
                    if (selectedSport.name && s.sport !== selectedSport.name) return false;
                    if (selectedPitch && s.surface !== selectedPitch) return false;
                    return true;
                });
                setSlots(filtered);
            } else {
                setSlots([]);
            }
        } catch {
            Alert.alert('Error', 'Failed to load slots. Check your network.');
            setSlots([]);
        } finally {
            setLoading(false);
        }
    }, [selectedVenue, date, selectedSport, selectedPitch]);

    // ── Bulk generate via backend ─────────────────────────────────────────────
    const bulkGenerate = async () => {
        if (!selectedVenue) { Alert.alert('Select Venue', 'Please select a venue first.'); return; }
        if (generating) return;
        setGenerating(true);
        try {
            const res = await adminApi.bulkGenerateSlots({
                venueId: selectedVenue,
                date,
                price: Number(price) || 200,
                sport: selectedSport.name,
                surface: selectedPitch,
            });
            if (res.success) {
                Alert.alert('✅ Done', `Slots generated for\n${selectedSport.name} – ${selectedPitch}\n${date}`);
                await loadSlots();
            } else {
                // Slots might already exist — offer to regenerate
                Alert.alert(
                    'Already Exists',
                    res.message || `Slots for ${selectedSport.name} – ${selectedPitch} on ${date} may already exist.\n\nDo you want to delete existing slots and regenerate?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Regenerate',
                            style: 'destructive',
                            onPress: async () => {
                                // Delete each existing slot then regenerate
                                const existing = await adminApi.getSlots(selectedVenue, date);
                                if (existing.success && Array.isArray(existing.data)) {
                                    const toDelete = existing.data.filter(
                                        (s: Slot) => s.sport === selectedSport.name && s.surface === selectedPitch
                                    );
                                    await Promise.all(toDelete.map((s: Slot) => adminApi.deleteSlot(s._id)));
                                }
                                const r2 = await adminApi.bulkGenerateSlots({
                                    venueId: selectedVenue,
                                    date,
                                    price: Number(price) || 200,
                                    sport: selectedSport.name,
                                    surface: selectedPitch,
                                });
                                if (r2.success) {
                                    Alert.alert('✅ Done', 'Slots regenerated!');
                                    await loadSlots();
                                } else {
                                    Alert.alert('Error', r2.message || 'Failed to regenerate slots.');
                                }
                            },
                        },
                    ],
                );
            }
        } catch {
            Alert.alert('Error', 'Failed to generate slots. Check your network.');
        } finally {
            setGenerating(false);
        }
    };

    // ── Toggle block via backend ──────────────────────────────────────────────
    const toggleBlock = async (slot: Slot) => {
        try {
            const res = await adminApi.toggleSlotBlock(slot._id);
            if (res.success) {
                setSlots(prev => prev.map(s =>
                    s._id === slot._id
                        ? { ...s, isBlocked: !s.isBlocked, isAvailable: s.isBlocked }
                        : s
                ));
            } else {
                Alert.alert('Error', res.message || 'Failed to toggle slot.');
            }
        } catch {
            Alert.alert('Error', 'Failed to toggle slot. Check your network.');
        }
    };

    // ── Slot card ─────────────────────────────────────────────────────────────
    const renderSlot = ({ item }: { item: Slot }) => (
        <View style={styles.slotCard}>
            {/* Sport + Pitch tag */}
            <View style={styles.slotTag}>
                <MaterialCommunityIcons
                    name={(item.sport === 'Football' ? 'soccer' : 'cricket') as any}
                    size={12} color="#FF5722"
                />
                <Text style={styles.slotTagText}>{item.sport} · {item.surface}</Text>
            </View>

            <View style={styles.slotRow}>
                <View style={styles.slotTime}>
                    <Ionicons name="time-outline" size={16} color="#FF5722" />
                    <Text style={styles.slotTimeText}>{item.startTime} – {item.endTime}</Text>
                </View>
                <Text style={styles.slotPrice}>₹{item.price}</Text>
                <View style={[styles.slotStatus, {
                    backgroundColor: item.isBlocked ? '#ef444415' : item.isBooked ? '#f59e0b15' : '#10b98115',
                }]}>
                    <Text style={[styles.slotStatusText, {
                        color: item.isBlocked ? '#ef4444' : item.isBooked ? '#f59e0b' : '#10b981',
                    }]}>
                        {item.isBlocked ? 'Blocked' : item.isBooked ? 'Booked' : 'Available'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.slotToggle} onPress={() => toggleBlock(item)} disabled={item.isBooked}>
                    <Ionicons
                        name={item.isBlocked ? 'lock-open-outline' : 'lock-closed-outline'}
                        size={16}
                        color={item.isBooked ? '#ccc' : item.isBlocked ? '#10b981' : '#ef4444'}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>

            {/* ── Filter Panel ──────────────────────────────────────── */}
            <View style={styles.filterPanel}>

                {/* Venue */}
                <Text style={styles.filterLabel}>Venue</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setShowVenuePicker(true)} disabled={venuesLoading}>
                    <Ionicons name="location-outline" size={16} color="#FF5722" style={{ marginRight: 6 }} />
                    <Text style={[styles.selectorText, { color: '#FF5722', fontWeight: '600' }]}>
                        {venuesLoading ? 'Loading venues...' : selectedVenueName}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#888" />
                </TouchableOpacity>

                {/* Sport + Pitch row */}
                <View style={styles.filterRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.filterLabel}>Sport</Text>
                        <TouchableOpacity style={styles.selector} onPress={() => setShowSportPicker(true)}>
                            <MaterialCommunityIcons name={selectedSport.icon as any} size={16} color="#FF5722" style={{ marginRight: 6 }} />
                            <Text style={[styles.selectorText, { color: '#FF5722', fontWeight: '600' }]}>
                                {selectedSport.name}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#888" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.filterLabel}>Pitch</Text>
                        <TouchableOpacity style={styles.selector} onPress={() => setShowPitchPicker(true)}>
                            <MaterialCommunityIcons name="stadium" size={16} color="#3b82f6" style={{ marginRight: 6 }} />
                            <Text style={[styles.selectorText, { color: '#3b82f6', fontWeight: '600' }]}>
                                {selectedPitch}
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#888" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date + Price */}
                <View style={styles.filterRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.filterLabel}>Date (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.input}
                            value={date}
                            onChangeText={setDate}
                            placeholder="2025-01-01"
                            placeholderTextColor="#bbb"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.filterLabel}>Price/hr (₹)</Text>
                        <TextInput
                            style={styles.input}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                            placeholder="200"
                            placeholderTextColor="#bbb"
                        />
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.loadBtn} onPress={loadSlots} disabled={venuesLoading}>
                        <Ionicons name="search-outline" size={16} color="#3b82f6" />
                        <Text style={styles.loadBtnText}>Load Slots</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.generateBtn} onPress={bulkGenerate} disabled={generating || venuesLoading}>
                        <MaterialCommunityIcons name="auto-fix" size={16} color="#fff" />
                        <Text style={styles.generateBtnText}>
                            {generating ? 'Generating…' : 'Bulk Generate'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Slot List ──────────────────────────────────────────── */}
            {loading ? (
                <ActivityIndicator style={{ marginTop: 40 }} color="#FF5722" />
            ) : (
                <FlatList
                    data={slots}
                    keyExtractor={i => i._id}
                    renderItem={renderSlot}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyWrapper}>
                            <MaterialCommunityIcons name="calendar-blank-outline" size={52} color="#ddd" />
                            <Text style={styles.emptyTitle}>No slots yet</Text>
                            <Text style={styles.emptyBody}>
                                Choose a sport, pitch & date,{'\n'}then tap <Text style={{ fontWeight: '700', color: '#FF5722' }}>Bulk Generate</Text>.
                            </Text>
                        </View>
                    }
                />
            )}

            {/* ── Venue Picker ─────────────────────────────────────────── */}
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
                                    onPress={() => { setSelectedVenue(v._id); setSelectedVenueName(v.name); setShowVenuePicker(false); }}
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

            {/* ── Sport Picker ─────────────────────────────────────────── */}
            <Modal visible={showSportPicker} animationType="slide" transparent>
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Select Sport</Text>
                            <TouchableOpacity onPress={() => setShowSportPicker(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={22} color="#333" />
                            </TouchableOpacity>
                        </View>
                        {SPORTS.map(s => (
                            <TouchableOpacity
                                key={s.id}
                                style={[styles.pickerItem, selectedSport.id === s.id && styles.pickerItemActive]}
                                onPress={() => { setSelectedSport(s); setShowSportPicker(false); }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <MaterialCommunityIcons name={s.icon as any} size={22} color={selectedSport.id === s.id ? '#FF5722' : '#555'} />
                                    <Text style={[styles.pickerItemText, selectedSport.id === s.id && styles.pickerItemTextActive]}>
                                        {s.name}
                                    </Text>
                                </View>
                                {selectedSport.id === s.id && <Ionicons name="checkmark" size={18} color="#FF5722" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* ── Pitch Picker ─────────────────────────────────────────── */}
            <Modal visible={showPitchPicker} animationType="slide" transparent>
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Select Pitch</Text>
                            <TouchableOpacity onPress={() => setShowPitchPicker(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={22} color="#333" />
                            </TouchableOpacity>
                        </View>
                        {PITCHES.map((p, i) => (
                            <TouchableOpacity
                                key={p}
                                style={[styles.pickerItem, selectedPitch === p && styles.pickerItemActive]}
                                onPress={() => { setSelectedPitch(p); setShowPitchPicker(false); }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <View style={[styles.pitchBadge, selectedPitch === p && styles.pitchBadgeActive]}>
                                        <Text style={[styles.pitchBadgeText, selectedPitch === p && styles.pitchBadgeTextActive]}>
                                            {i + 1}
                                        </Text>
                                    </View>
                                    <Text style={[styles.pickerItemText, selectedPitch === p && styles.pickerItemTextActive]}>
                                        {p}
                                    </Text>
                                </View>
                                {selectedPitch === p && <Ionicons name="checkmark" size={18} color="#3b82f6" />}
                            </TouchableOpacity>
                        ))}
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

    selector: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12,
        backgroundColor: '#fff',
    },
    selectorText: { fontSize: 14, color: '#111', flex: 1 },

    filterRow: { flexDirection: 'row', gap: 10 },
    input: {
        borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
        padding: 12, color: '#111', fontSize: 14, backgroundColor: '#fff',
    },
    btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
    loadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#3b82f6' },
    loadBtnText: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
    generateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 10, backgroundColor: '#FF5722' },
    generateBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },

    // Slot list
    list: { padding: 16 },
    emptyWrapper: { alignItems: 'center', marginTop: 60, gap: 12 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#555' },
    emptyBody: { textAlign: 'center', color: '#999', fontSize: 14, lineHeight: 22 },

    slotCard: {
        backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    },
    slotTag: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#FFF3F0', paddingHorizontal: 10, paddingVertical: 4,
    },
    slotTagText: { fontSize: 11, color: '#FF5722', fontWeight: '600' },
    slotRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
    slotTime: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 2 },
    slotTimeText: { fontSize: 13, color: '#333', fontWeight: '500' },
    slotPrice: { fontSize: 13, fontWeight: '600', color: '#FF5722', flex: 1, textAlign: 'center' },
    slotStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, flex: 2, alignItems: 'center' },
    slotStatusText: { fontSize: 11, fontWeight: '700' },
    slotToggle: { padding: 4 },

    // Pickers
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    pickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    pickerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
    pickerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    pickerItemActive: { backgroundColor: '#FF572208' },
    pickerItemText: { fontSize: 15, color: '#333' },
    pickerItemTextActive: { fontWeight: '700', color: '#FF5722' },
    pitchBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
    pitchBadgeActive: { backgroundColor: '#3b82f6' },
    pitchBadgeText: { fontSize: 13, fontWeight: 'bold', color: '#555' },
    pitchBadgeTextActive: { color: '#fff' },
});
