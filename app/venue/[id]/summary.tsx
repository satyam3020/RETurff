import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '../../../utils/theme';
import { useBookings } from '../../../context/BookingContext';

export default function BookingSummaryScreen() {
    const params = useLocalSearchParams();
    const { addBooking } = useBookings();
    const [termsChecked, setTermsChecked] = useState(false);
    const [rulesExpanded, setRulesExpanded] = useState(false);
    const [couponExpanded, setCouponExpanded] = useState(false);

    // ── Extract real params passed from the booking screen ──
    const venueId = (params.venueId as string) || '';
    const venueName = (params.venueName as string) || 'Unknown Venue';
    const venueLocation = (params.venueLocation as string) || '';
    const date = (params.date as string) || '';
    const sport = (params.sport as string) || 'General';
    const surface = (params.surface as string) || '';

    // Parse multiple slots from JSON (new multi-select flow)
    const parsedSlots: { _id: string; startTime: string; endTime: string; price: number; surface?: string }[] =
        params.slotsJson ? JSON.parse(params.slotsJson as string) : [];

    // Fallback: legacy single-slot params
    const legacySlotId = (params.slotId as string) || '';
    const legacyStartTime = (params.startTime as string) || '';
    const legacyEndTime = (params.endTime as string) || '';
    const legacyPrice = Number(params.price) || 0;

    // Final slots list to display & book
    const allSlots = parsedSlots.length > 0
        ? parsedSlots
        : legacySlotId ? [{ _id: legacySlotId, startTime: legacyStartTime, endTime: legacyEndTime, price: legacyPrice, surface }] : [];

    const slotsBaseTotal = allSlots.reduce((sum, s) => sum + s.price, 0);
    const convenienceFee = Math.round(slotsBaseTotal * 0.03);
    const slotTotal = slotsBaseTotal + convenienceFee;
    const payableAmount = slotTotal;

    const handleConfirmBooking = async () => {
        if (!termsChecked) return;

        if (!venueId || allSlots.length === 0 || !date) {
            Alert.alert('Error', 'Booking details are incomplete. Please go back and select a slot.');
            return;
        }

        // Create one booking per slot
        let failed = 0;
        for (const slot of allSlots) {
            const newBooking = {
                venueId,
                slotId: slot._id,
                date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                sport,
                surface: slot.surface || surface,
                totalAmount: Math.round(payableAmount / allSlots.length),
            };
            const result = await addBooking(newBooking);
            if (!result.success) failed++;
        }

        if (failed === allSlots.length) {
            Alert.alert('Booking Failed', 'Could not create bookings. Please try again.');
            return;
        }

        Alert.alert(
            '✅ Booking Confirmed!',
            `${allSlots.length - failed} slot${allSlots.length - failed > 1 ? 's' : ''} booked. Status is Pending until admin confirms. You can pay at the venue.`,
            [
                {
                    text: 'View Bookings',
                    onPress: () => router.replace('/(tabs)/slots' as any),
                },
            ]
        );
    };


    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{venueName}</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.headerSubtitle}>{venueLocation}</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Venue Rules Card — Expandable */}
                <View style={styles.rulesSection}>
                    <TouchableOpacity style={styles.rulesCard} onPress={() => setRulesExpanded(!rulesExpanded)}>
                        <View style={styles.rulesLeft}>
                            <Text style={styles.rulesTitle}>Venue Rules & Cancellation Policy</Text>
                            {!rulesExpanded && (
                                <>
                                    <Text style={styles.rulesSubtitle}>• Check cancellation terms</Text>
                                    <Text style={styles.rulesSubtitle}>• Know the venue's T&Cs</Text>
                                </>
                            )}
                        </View>
                        <Ionicons name={rulesExpanded ? 'chevron-down' : 'chevron-forward'} size={20} color="#666" />
                    </TouchableOpacity>

                    {rulesExpanded && (
                        <View style={styles.rulesContent}>
                            <Text style={styles.rulesHeading}>Rules</Text>
                            <Text style={styles.ruleText}>Wear appropriate sports attire and shoes while playing.</Text>
                            <Text style={styles.ruleText}>Be present at the venue 10 mins prior to the booked slot.</Text>
                            <Text style={styles.ruleText}>Management is not responsible for loss of personal belongings or any injuries caused during the match.</Text>
                            <Text style={styles.ruleText}>No water and food allowed from outside.</Text>
                            <Text style={styles.ruleText}>Please Carry Your Football or Cricket Bats.</Text>

                            <Text style={[styles.rulesHeading, { marginTop: 16 }]}>Additional Terms & Conditions</Text>
                            <Text style={styles.ruleText}>No Smoking</Text>
                            <Text style={styles.ruleText}>No Drinking</Text>

                            <Text style={[styles.rulesHeading, { marginTop: 16 }]}>Cancellation Policy</Text>
                            <View style={styles.policyItem}>
                                <View style={styles.policyDot} />
                                <Text style={styles.policyText}>Non Refundable if cancellation is made less than 12 hours from the slot start time.</Text>
                            </View>
                            <View style={styles.policyItem}>
                                <View style={styles.policyDot} />
                                <Text style={styles.policyText}>50% Refundable if cancellation is made 12 hours before the slot start time.</Text>
                            </View>
                            <View style={styles.policyItem}>
                                <View style={styles.policyDot} />
                                <Text style={styles.policyText}>100% Refundable if cancellation is made 24 hours before the slot start time.</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Slot Details */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Slot Details ({String(allSlots.length).padStart(2, '0')})</Text>
                    </View>

                    <Text style={styles.dateText}>{date}</Text>

                    {allSlots.map((slot, i) => (
                        <View key={slot._id || i} style={styles.slotCard}>
                            <View style={styles.slotLeft}>
                                <Text style={styles.slotTime}>{slot.startTime} – {slot.endTime}</Text>
                                {!!(slot.surface || surface) && <Text style={styles.slotSurface}>{slot.surface || surface}</Text>}
                                <Text style={styles.slotCourt}>{sport}</Text>
                            </View>
                            <View style={styles.slotRight}>
                                <Text style={styles.slotPrice}>₹{slot.price}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Apply Coupon */}
                <TouchableOpacity
                    style={styles.couponSection}
                    onPress={() => setCouponExpanded(!couponExpanded)}
                >
                    <View style={styles.couponLeft}>
                        <MaterialCommunityIcons name="brightness-percent" size={20} color="#FF5722" />
                        <Text style={styles.couponText}>Apply Coupon</Text>
                    </View>
                    <Ionicons
                        name={couponExpanded ? 'chevron-up' : 'chevron-forward'}
                        size={20}
                        color="#666"
                    />
                </TouchableOpacity>

                {/* Booking Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Booking Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Sports</Text>
                        <Text style={styles.summaryValue}>{sport}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Slots ({allSlots.length}) Base Price</Text>
                        <Text style={styles.summaryValue}>₹{slotsBaseTotal}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Convenience Fees (3%)</Text>
                        <Text style={styles.summaryValue}>+₹{convenienceFee}</Text>
                    </View>

                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Slot Total</Text>
                        <Text style={styles.totalValue}>₹{slotTotal}</Text>
                    </View>

                    {/* Payable Amount */}
                    <View style={[styles.summaryRow, styles.payableRow]}>
                        <Text style={styles.payableLabel}>Payable Amount</Text>
                        <Text style={styles.payableValue}>₹{payableAmount}</Text>
                    </View>
                </View>

                {/* Terms & Conditions */}
                <TouchableOpacity
                    style={styles.termsRow}
                    onPress={() => setTermsChecked(!termsChecked)}
                >
                    <MaterialCommunityIcons
                        name={termsChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={20}
                        color={termsChecked ? '#4CAF50' : '#999'}
                    />
                    <Text style={styles.termsText}>
                        I hereby agree to the{' '}
                        <Text style={styles.termsLink}>Terms & Conditions</Text> of{' '}
                        <Text style={styles.termsLink}>RETurf</Text>
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.bottomBarLeft}>
                    <Text style={styles.bottomBarAmount}>₹{payableAmount} Incl. Taxes</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.payButton,
                        !termsChecked && styles.payButtonDisabled
                    ]}
                    onPress={handleConfirmBooking}
                    disabled={!termsChecked}
                >
                    <Text style={styles.payButtonText}>CONFIRM BOOKING</Text>
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: SPACING.md,
    },
    headerRight: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    headerSubtitle: {
        fontSize: 11,
        color: '#666',
    },
    scrollView: {
        flex: 1,
    },
    rulesCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E3F2FD',
        padding: SPACING.md,
        marginTop: SPACING.md,
        marginHorizontal: SPACING.md,
        borderRadius: 8,
    },
    rulesLeft: {
        flex: 1,
    },
    rulesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    rulesSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    section: {
        backgroundColor: COLORS.white,
        marginTop: SPACING.md,
        padding: SPACING.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    viewAllLink: {
        fontSize: 12,
        color: '#FF5722',
        fontWeight: '600',
    },
    dateText: {
        fontSize: 13,
        color: '#666',
        marginBottom: SPACING.sm,
    },
    slotCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    slotLeft: {
        flex: 1,
    },
    slotTime: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    slotSurface: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    slotCourt: {
        fontSize: 12,
        color: '#666',
    },
    slotRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    slotPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    couponSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        marginTop: SPACING.md,
        padding: SPACING.md,
    },
    couponLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    couponText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: SPACING.sm,
        paddingTop: SPACING.sm,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    rulesSection: { marginTop: SPACING.md },
    rulesContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, backgroundColor: COLORS.white },
    rulesHeading: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    ruleText: { fontSize: 14, color: '#555', lineHeight: 21, marginBottom: 10 },
    policyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
    policyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333', marginTop: 6 },
    policyText: { flex: 1, fontSize: 14, color: '#555', lineHeight: 21 },
    payableRow: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
    },
    payableLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    payableValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: COLORS.white,
        marginTop: SPACING.md,
        padding: SPACING.md,
    },
    termsText: {
        flex: 1,
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
    termsLink: {
        color: '#03A9F4',
        fontWeight: '600',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    bottomBarLeft: {
        flex: 1,
    },
    bottomBarAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    payButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 6,
    },
    payButtonDisabled: {
        backgroundColor: '#E0E0E0',
    },
    payButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.white,
    },
});
