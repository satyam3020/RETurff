import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '../../../utils/theme';

// Mock slot data
const MOCK_SLOTS = [
    { id: '1', time: '00:00 - 00:30', price: 200, available: true, group: 'Mid-Night Slots' },
    { id: '2', time: '00:30 - 1:00', price: 200, available: true, group: 'Mid-Night Slots' },
    { id: '3', time: '6:00 - 6:30', price: 200, available: false, group: 'Morning Slots' },
    { id: '4', time: '6:30 - 7:00', price: 200, available: false, group: 'Morning Slots' },
    { id: '5', time: '7:00 - 7:30', price: 200, available: true, group: 'Morning Slots' },
    { id: '6', time: '7:30 - 8:00', price: 200, available: true, group: 'Morning Slots' },
    { id: '7', time: '8:00 - 8:30', price: 200, available: true, group: 'Morning Slots' },
];

const DATES = [
    { day: 'Wed', date: 18, month: 'Feb' },
    { day: 'Thu', date: 19, month: 'Feb' },
    { day: 'Fri', date: 20, month: 'Feb' },
    { day: 'Sat', date: 21, month: 'Feb' },
    { day: 'Sun', date: 22, month: 'Feb' },
    { day: 'Mon', date: 23, month: 'Feb' },
    { day: 'Tue', date: 24, month: 'Feb' },
];

export default function SlotBookingScreen() {
    const params = useLocalSearchParams();
    const [selectedDate, setSelectedDate] = useState(0);
    const [selectedCourt, setSelectedCourt] = useState('full');
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const surface = params.surface as string || '8 layered Acrylic Surface';

    const toggleSlot = (slotId: string) => {
        if (selectedSlots.includes(slotId)) {
            setSelectedSlots(selectedSlots.filter(id => id !== slotId));
        } else {
            setSelectedSlots([...selectedSlots, slotId]);
        }
    };

    const getTotalAmount = () => {
        return selectedSlots.length * 200;
    };

    const groupedSlots = MOCK_SLOTS.reduce((acc, slot) => {
        if (!acc[slot.group]) {
            acc[slot.group] = [];
        }
        acc[slot.group].push(slot);
        return acc;
    }, {} as Record<string, typeof MOCK_SLOTS>);

    const handleProceed = () => {
        if (selectedSlots.length > 0) {
            setShowConfirmModal(true);
        }
    };

    const handleConfirmSlots = () => {
        setShowConfirmModal(false);
        router.push(`/venue/${params.id}/summary` as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Pitchnova Sports Arena</Text>
                    <Text style={styles.headerSubtitle}>Near Fire Brigade, Bhayandar West</Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.cartBadge}>
                        <Ionicons name="cart" size={20} color={COLORS.white} />
                        {selectedSlots.length > 0 && (
                            <View style={styles.cartCount}>
                                <Text style={styles.cartCountText}>{selectedSlots.length}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Date Selector */}
            <View style={styles.dateSection}>
                <Text style={styles.monthYear}>February 2026</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                    <TouchableOpacity style={styles.dateNavButton}>
                        <Ionicons name="chevron-back" size={20} color="#666" />
                    </TouchableOpacity>
                    {DATES.map((date, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dateCard,
                                selectedDate === index && styles.selectedDateCard
                            ]}
                            onPress={() => setSelectedDate(index)}
                        >
                            <Text style={[
                                styles.dateDay,
                                selectedDate === index && styles.selectedDateText
                            ]}>{date.day}</Text>
                            <Text style={[
                                styles.dateNumber,
                                selectedDate === index && styles.selectedDateText
                            ]}>{date.date}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.dateNavButton}>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Surface Info */}
                <View style={styles.surfaceSection}>
                    <Text style={styles.surfaceText}>{surface}</Text>
                    <View style={styles.surfaceUnderline} />
                </View>

                {/* Slots Info */}
                <View style={styles.slotsInfo}>
                    <Text style={styles.slotsAvailable}>Available Slots (38)</Text>
                    <View style={styles.slotDuration}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#FF9800" />
                        <Text style={styles.slotDurationText}>Min. 60 mins slot</Text>
                    </View>
                </View>

                {/* Court Selection */}
                <View style={styles.courtSection}>
                    <TouchableOpacity
                        style={[styles.courtTab, selectedCourt === 'full' && styles.selectedCourtTab]}
                        onPress={() => setSelectedCourt('full')}
                    >
                        <Text style={[
                            styles.courtTabText,
                            selectedCourt === 'full' && styles.selectedCourtTabText
                        ]}>Full Court</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.courtTab, selectedCourt === 'court2' && styles.selectedCourtTab]}
                        onPress={() => setSelectedCourt('court2')}
                    >
                        <Text style={[
                            styles.courtTabText,
                            selectedCourt === 'court2' && styles.selectedCourtTabText
                        ]}>Pickleball Court 2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.courtTab, selectedCourt === 'court1' && styles.selectedCourtTab]}
                        onPress={() => setSelectedCourt('court1')}
                    >
                        <Text style={[
                            styles.courtTabText,
                            selectedCourt === 'court1' && styles.selectedCourtTabText
                        ]}>Pickleball Court 1</Text>
                    </TouchableOpacity>
                </View>

                {/* Slots by Group */}
                {Object.entries(groupedSlots).map(([group, slots]) => (
                    <View key={group} style={styles.slotGroup}>
                        <View style={styles.slotGroupHeader}>
                            <MaterialCommunityIcons
                                name={group.includes('Morning') ? 'white-balance-sunny' : 'moon-waning-crescent'}
                                size={16}
                                color={group.includes('Morning') ? '#FF9800' : '#666'}
                            />
                            <Text style={styles.slotGroupTitle}>{group}</Text>
                        </View>
                        {slots.map((slot) => {
                            const isSelected = selectedSlots.includes(slot.id);
                            return (
                                <View key={slot.id} style={styles.slotCard}>
                                    <View style={styles.slotInfo}>
                                        <Text style={[
                                            styles.slotTime,
                                            !slot.available && styles.slotTimeDisabled
                                        ]}>{slot.time}</Text>
                                        <Text style={[
                                            styles.slotPrice,
                                            !slot.available && styles.slotPriceDisabled
                                        ]}>₹{slot.price}</Text>
                                    </View>
                                    {slot.available ? (
                                        <TouchableOpacity
                                            style={[
                                                styles.slotButton,
                                                isSelected && styles.slotButtonSelected
                                            ]}
                                            onPress={() => toggleSlot(slot.id)}
                                        >
                                            <Ionicons
                                                name={isSelected ? 'remove-circle' : 'add-circle'}
                                                size={24}
                                                color={isSelected ? '#F44336' : '#4CAF50'}
                                            />
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.bookedBadge}>
                                            <Ionicons name="close-circle" size={24} color="#F44336" />
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Bar */}
            {selectedSlots.length > 0 && (
                <View style={styles.bottomBar}>
                    <View style={styles.bottomBarLeft}>
                        <Text style={styles.bottomBarSlots}>{selectedSlots.length} Slot(s)</Text>
                        <Text style={styles.bottomBarPrice}>₹{getTotalAmount()} Plus Charges</Text>
                    </View>
                    <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
                        <Text style={styles.proceedButtonText}>PROCEED</Text>
                        <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Confirm Your Selection</Text>
                            <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalDate}>18 Feb 2026</Text>

                        {selectedSlots.map((slotId) => {
                            const slot = MOCK_SLOTS.find(s => s.id === slotId);
                            return (
                                <View key={slotId} style={styles.modalSlot}>
                                    <Text style={styles.modalSlotTime}>{slot?.time}</Text>
                                    <Text style={styles.modalSlotSurface}>{surface} (Full Court)</Text>
                                </View>
                            );
                        })}

                        <View style={styles.modalNote}>
                            <MaterialCommunityIcons name="information" size={16} color="#FF9800" />
                            <Text style={styles.modalNoteText}>24-hour format for slots is used.</Text>
                        </View>

                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmSlots}>
                            <Text style={styles.confirmButtonText}>CONFIRM SLOTS</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
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
    headerCenter: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 11,
        color: '#666',
    },
    headerRight: {
        marginLeft: SPACING.sm,
    },
    cartBadge: {
        backgroundColor: '#FF5722',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    cartCount: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#F44336',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartCountText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    dateSection: {
        backgroundColor: COLORS.white,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    monthYear: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    dateScroll: {
        paddingHorizontal: SPACING.sm,
    },
    dateNavButton: {
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateCard: {
        width: 50,
        paddingVertical: SPACING.sm,
        marginHorizontal: 4,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    selectedDateCard: {
        backgroundColor: '#4CAF50',
    },
    dateDay: {
        fontSize: 11,
        color: '#666',
        marginBottom: 4,
    },
    dateNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    selectedDateText: {
        color: COLORS.white,
    },
    scrollView: {
        flex: 1,
    },
    surfaceSection: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    surfaceText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
        textAlign: 'center',
    },
    surfaceUnderline: {
        height: 3,
        backgroundColor: '#4CAF50',
        marginTop: 6,
        marginHorizontal: 60,
        borderRadius: 2,
    },
    slotsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    slotsAvailable: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    slotDuration: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    slotDurationText: {
        fontSize: 12,
        color: '#FF9800',
    },
    courtSection: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        gap: 8,
    },
    courtTab: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    selectedCourtTab: {
        backgroundColor: '#4CAF50',
    },
    courtTabText: {
        fontSize: 12,
        color: '#4CAF50',
    },
    selectedCourtTabText: {
        color: COLORS.white,
        fontWeight: '600',
    },
    slotGroup: {
        backgroundColor: COLORS.white,
        marginTop: SPACING.md,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    slotGroupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: SPACING.md,
    },
    slotGroupTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    slotCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    slotInfo: {
        flex: 1,
    },
    slotTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    slotPrice: {
        fontSize: 13,
        color: '#666',
    },
    slotTimeDisabled: {
        color: '#999',
    },
    slotPriceDisabled: {
        color: '#999',
    },
    slotButton: {
        padding: 4,
    },
    slotButtonSelected: {
        // Additional styling if needed
    },
    bookedBadge: {
        padding: 4,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#4CAF50',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    bottomBarLeft: {
        flex: 1,
    },
    bottomBarSlots: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    bottomBarPrice: {
        fontSize: 12,
        color: COLORS.white,
    },
    proceedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
        gap: 6,
    },
    proceedButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.lg,
        width: '100%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: SPACING.md,
    },
    modalSlot: {
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalSlotTime: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    modalSlotSurface: {
        fontSize: 13,
        color: '#666',
    },
    modalNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFF8E1',
        padding: SPACING.sm,
        borderRadius: 6,
        marginTop: SPACING.md,
    },
    modalNoteText: {
        flex: 1,
        fontSize: 12,
        color: '#666',
    },
    confirmButton: {
        backgroundColor: '#FF5722',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: SPACING.lg,
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.white,
    },
});
