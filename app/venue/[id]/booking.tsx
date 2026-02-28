import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '../../../utils/theme';
import { getAvailableSlots } from '../../../services/api';

// ─── Generate next N dates starting from today ────────────────────────────────
const generateDates = (count = 7) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Array.from({ length: count }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            day: days[d.getDay()],
            date: d.getDate(),
            month: months[d.getMonth()],
            year: d.getFullYear(),
            // ISO date string for API calls
            isoDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            // Display string for UI
            label: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
        };
    });
};

const DATES = generateDates(7);

// ─── Slot type from backend ────────────────────────────────────────────────────
interface Slot {
    _id: string;
    startTime: string;
    endTime: string;
    price: number;
    isBooked: boolean;
    isBlocked: boolean;
    surface?: string;
    sport?: string;
    group?: string;
}

interface GroupedSlots {
    [group: string]: Slot[];
}

export default function SlotBookingScreen() {
    const params = useLocalSearchParams();
    const venueId = params.id as string;
    const venueName = (params.venueName as string) || 'Venue';
    const venueLocation = (params.venueLocation as string) || '';
    const sport = (params.sport as string) || 'General';
    const surface = (params.surface as string) || '';

    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const selectedDate = DATES[selectedDateIndex];

    // ── Helper: parse "H:MM AM/PM" to minutes since midnight ────────────────
    const parseTimeToMinutes = (time: string): number => {
        const parts = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!parts) return 0;
        let hour = parseInt(parts[1], 10);
        const min = parseInt(parts[2], 10);
        const period = parts[3].toUpperCase();
        if (period === 'AM' && hour === 12) hour = 0;
        if (period === 'PM' && hour !== 12) hour += 12;
        return hour * 60 + min;
    };

    // ── Check if selected date is today ─────────────────────────────────────
    const isToday = selectedDate.isoDate === DATES[0].isoDate;

    // ── Filter out expired slots for today ──────────────────────────────────
    const activeSlots = isToday
        ? slots.filter((slot) => {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            return parseTimeToMinutes(slot.startTime) > currentMinutes;
        })
        : slots;

    // ── Group slots by time-of-day ──────────────────────────────────────────
    const groupedSlots: GroupedSlots = activeSlots.reduce((acc, slot) => {
        const hour = parseInt(slot.startTime.split(':')[0], 10);
        let group = 'Evening Slots';
        if (hour < 6) group = 'Mid-Night Slots';
        else if (hour < 12) group = 'Morning Slots';
        else if (hour < 17) group = 'Afternoon Slots';
        if (!acc[group]) acc[group] = [];
        acc[group].push(slot);
        return acc;
    }, {} as GroupedSlots);

    // ── Fetch slots directly from backend with sport + surface filter ─────────
    const fetchSlots = useCallback(async () => {
        if (!venueId) return;
        setIsLoading(true);
        setSelectedSlots([]);
        try {
            const res = await getAvailableSlots(venueId, selectedDate.isoDate, sport, surface);
            if (res.success && Array.isArray(res.data)) {
                setSlots(res.data);
            } else {
                setSlots([]);
            }
        } catch (e) {
            setSlots([]);
            console.warn('Failed to load slots', e);
        } finally {
            setIsLoading(false);
        }
    }, [venueId, selectedDate.isoDate, sport, surface]);

    useEffect(() => { fetchSlots(); }, [fetchSlots]);

    const availableCount = activeSlots.filter((s) => !s.isBooked && !s.isBlocked).length;
    const totalPrice = selectedSlots.reduce((sum, s) => sum + s.price, 0);

    // Toggle a slot in/out of selectedSlots
    const toggleSlot = (slot: Slot) => {
        setSelectedSlots(prev =>
            prev.find(s => s._id === slot._id)
                ? prev.filter(s => s._id !== slot._id)
                : [...prev, slot]
        );
    };

    const handleProceed = () => {
        if (selectedSlots.length > 0) setShowConfirmModal(true);
    };

    // Navigate to summary with all selected slots
    const handleConfirmSlots = () => {
        if (selectedSlots.length === 0) return;
        setShowConfirmModal(false);
        router.push({
            pathname: `/venue/${venueId}/summary` as any,
            params: {
                venueId,
                venueName,
                venueLocation,
                // Pass all selected slots as JSON string
                slotsJson: JSON.stringify(selectedSlots),
                date: selectedDate.label,
                sport,
                surface,
                totalPrice: String(totalPrice),
            },
        });
    };

    const isSlotActive = (slot: Slot) => !slot.isBooked && !slot.isBlocked;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{venueName}</Text>
                    {!!venueLocation && <Text style={styles.headerSubtitle}>{venueLocation}</Text>}
                </View>
                <View style={{ width: 36 }} />
            </View>

            {/* Date Selector */}
            <View style={styles.dateSection}>
                <Text style={styles.monthYear}>{selectedDate.month} {selectedDate.year}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                    {DATES.map((d, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.dateCard, selectedDateIndex === index && styles.selectedDateCard]}
                            onPress={() => setSelectedDateIndex(index)}
                        >
                            <Text style={[styles.dateDay, selectedDateIndex === index && styles.selectedDateText]}>{d.day}</Text>
                            <Text style={[styles.dateNumber, selectedDateIndex === index && styles.selectedDateText]}>{d.date}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Surface Info */}
                {!!surface && (
                    <View style={styles.surfaceSection}>
                        <Text style={styles.surfaceText}>{surface}</Text>
                        <View style={styles.surfaceUnderline} />
                    </View>
                )}

                {/* Slots Info */}
                <View style={styles.slotsInfo}>
                    {isLoading
                        ? <ActivityIndicator size="small" color="#4CAF50" />
                        : <Text style={styles.slotsAvailable}>
                            Available Slots ({availableCount})
                        </Text>
                    }
                    <View style={styles.slotDuration}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#FF9800" />
                        <Text style={styles.slotDurationText}>Select one slot</Text>
                    </View>
                </View>

                {/* Slots */}
                {isLoading ? (
                    <View style={styles.loaderWrapper}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                        <Text style={styles.loadingText}>Loading slots…</Text>
                    </View>
                ) : slots.length === 0 ? (
                    <View style={styles.emptyWrapper}>
                        <MaterialCommunityIcons name="calendar-remove" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No slots available for this date</Text>
                        <TouchableOpacity onPress={fetchSlots} style={styles.retryButton}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    Object.entries(groupedSlots).map(([group, groupSlots]) => (
                        <View key={group} style={styles.slotGroup}>
                            <View style={styles.slotGroupHeader}>
                                <MaterialCommunityIcons
                                    name={
                                        group.includes('Morning') ? 'white-balance-sunny' :
                                            group.includes('Afternoon') ? 'weather-partly-cloudy' :
                                                group.includes('Evening') ? 'weather-sunset' :
                                                    'moon-waning-crescent'
                                    }
                                    size={16}
                                    color={group.includes('Morning') ? '#FF9800' : '#666'}
                                />
                                <Text style={styles.slotGroupTitle}>{group}</Text>
                            </View>
                            {groupSlots.map((slot) => {
                                const active = isSlotActive(slot);
                                const isSelected = !!selectedSlots.find(s => s._id === slot._id);
                                return (
                                    <View key={slot._id} style={[styles.slotCard, isSelected && styles.slotCardSelected]}>
                                        <View style={styles.slotInfo}>
                                            <Text style={[styles.slotTime, !active && styles.slotTimeDisabled]}>
                                                {slot.startTime} – {slot.endTime}
                                            </Text>
                                            <Text style={[styles.slotPrice, !active && styles.slotPriceDisabled]}>
                                                ₹{slot.price}
                                            </Text>
                                        </View>
                                        {active ? (
                                            <TouchableOpacity
                                                style={[styles.slotButton, isSelected && styles.slotButtonSelected]}
                                                onPress={() => toggleSlot(slot)}
                                            >
                                                <Ionicons
                                                    name={isSelected ? 'remove-circle' : 'add-circle'}
                                                    size={24}
                                                    color={isSelected ? '#F44336' : '#4CAF50'}
                                                />
                                            </TouchableOpacity>
                                        ) : (
                                            <View style={styles.bookedBadge}>
                                                <Text style={styles.bookedLabel}>
                                                    {slot.isBooked ? 'Booked' : 'Blocked'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ))
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Bar */}
            {selectedSlots.length > 0 && (
                <View style={styles.bottomBar}>
                    <View style={styles.bottomBarLeft}>
                        <Text style={styles.bottomBarSlots}>
                            {selectedSlots.length} Slot{selectedSlots.length > 1 ? 's' : ''} Selected
                        </Text>
                        <Text style={styles.bottomBarPrice}>₹{totalPrice} + charges</Text>
                    </View>
                    <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
                        <Text style={styles.proceedButtonText}>PROCEED</Text>
                        <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && selectedSlots.length > 0 && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Confirm {selectedSlots.length} Slot{selectedSlots.length > 1 ? 's' : ''}</Text>
                            <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalDate}>{selectedDate.label}</Text>

                        {selectedSlots.map((slot, i) => (
                            <View key={slot._id} style={styles.modalSlot}>
                                <Text style={styles.modalSlotTime}>{slot.startTime} – {slot.endTime}</Text>
                                <Text style={styles.modalSlotSurface}>{slot.surface || surface} — ₹{slot.price}</Text>
                            </View>
                        ))}

                        <View style={[styles.modalSlot, { borderBottomWidth: 0, marginTop: 4 }]}>
                            <Text style={[styles.modalSlotTime, { color: '#FF5722' }]}>Total: ₹{totalPrice}</Text>
                        </View>

                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmSlots}>
                            <Text style={styles.confirmButtonText}>CONFIRM {selectedSlots.length} SLOT{selectedSlots.length > 1 ? 'S' : ''}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerCenter: { flex: 1, marginLeft: SPACING.md },
    headerTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
    headerSubtitle: { fontSize: 11, color: '#666' },
    dateSection: {
        backgroundColor: COLORS.white,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    monthYear: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: SPACING.sm },
    dateScroll: { paddingHorizontal: SPACING.sm },
    dateCard: {
        width: 50, paddingVertical: SPACING.sm, marginHorizontal: 4,
        borderRadius: 8, alignItems: 'center', backgroundColor: '#f5f5f5',
    },
    selectedDateCard: { backgroundColor: '#4CAF50' },
    dateDay: { fontSize: 11, color: '#666', marginBottom: 4 },
    dateNumber: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    selectedDateText: { color: COLORS.white },
    scrollView: { flex: 1 },
    surfaceSection: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
    surfaceText: { fontSize: 16, fontWeight: '600', color: '#4CAF50', textAlign: 'center' },
    surfaceUnderline: { height: 3, backgroundColor: '#4CAF50', marginTop: 6, marginHorizontal: 60, borderRadius: 2 },
    slotsInfo: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    slotsAvailable: { fontSize: 14, fontWeight: '600', color: '#333' },
    slotDuration: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    slotDurationText: { fontSize: 12, color: '#FF9800' },
    loaderWrapper: { alignItems: 'center', paddingVertical: 48, gap: 12 },
    loadingText: { fontSize: 14, color: '#999' },
    emptyWrapper: { alignItems: 'center', paddingVertical: 48, gap: 12 },
    emptyText: { fontSize: 15, color: '#999' },
    retryButton: { backgroundColor: '#4CAF50', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 6 },
    retryButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
    slotGroup: { backgroundColor: COLORS.white, marginTop: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    slotGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
    slotGroupTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
    slotCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0',
    },
    slotCardSelected: { borderColor: '#4CAF50', backgroundColor: '#F1F8F1' },
    slotInfo: { flex: 1 },
    slotTime: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2 },
    slotPrice: { fontSize: 13, color: '#666' },
    slotTimeDisabled: { color: '#999' },
    slotPriceDisabled: { color: '#999' },
    slotButton: { padding: 4 },
    slotButtonSelected: {},
    bookedBadge: { backgroundColor: '#FFEBEE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    bookedLabel: { fontSize: 11, color: '#F44336', fontWeight: '600' },
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#4CAF50', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    bottomBarLeft: { flex: 1 },
    bottomBarSlots: { fontSize: 14, fontWeight: 'bold', color: COLORS.white },
    bottomBarPrice: { fontSize: 12, color: COLORS.white },
    proceedButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, gap: 6,
    },
    proceedButtonText: { fontSize: 13, fontWeight: 'bold', color: '#4CAF50' },
    modalOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg,
    },
    modalContent: { backgroundColor: COLORS.white, borderRadius: 12, padding: SPACING.lg, width: '100%', maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    modalDate: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: SPACING.md },
    modalSlot: { paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalSlotTime: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
    modalSlotSurface: { fontSize: 13, color: '#666' },
    modalNote: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#FFF8E1', padding: SPACING.sm, borderRadius: 6, marginTop: SPACING.md,
    },
    modalNoteText: { flex: 1, fontSize: 12, color: '#666' },
    confirmButton: { backgroundColor: '#FF5722', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: SPACING.lg },
    confirmButtonText: { fontSize: 14, fontWeight: 'bold', color: COLORS.white },
});
