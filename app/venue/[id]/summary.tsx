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
    const [insuranceChecked, setInsuranceChecked] = useState(true);
    const [termsChecked, setTermsChecked] = useState(false);
    const [couponExpanded, setCouponExpanded] = useState(false);

    // Mock booking data
    const bookingData = {
        slots: [
            { time: '6:00 - 6:30', surface: '8 layered Acrylic Surface (Full ...', court: 'Pickleball Court 2', price: 200 },
            { time: '6:30 - 7:00', surface: '8 layered Acrylic Surface (Full ...', court: 'Pickleball Court 2', price: 200 },
        ],
        sport: 'Pickleball',
        basePrice: 400,
        convenienceFee: 12,
        insurance: 10,
    };

    const slotTotal = bookingData.basePrice + bookingData.convenienceFee;
    const payableAmount = slotTotal + (insuranceChecked ? bookingData.insurance : 0);

    const handleConfirmBooking = async () => {
        if (!termsChecked) return;
        const newBooking = {
            id: Date.now().toString(),
            turfName: 'Pitchnova Sports Arena',
            location: 'Near Fire Brigade, Bhayandar West',
            date: '18 Feb 2026',
            slots: bookingData.slots,
            sport: bookingData.sport,
            totalAmount: payableAmount,
            status: 'payment_pending' as const,
            confirmedAt: new Date().toISOString(),
        };
        await addBooking(newBooking);
        Alert.alert(
            '✅ Booking Confirmed!',
            'Your booking has been confirmed. Payment is pending — you can pay at the venue.',
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
                <Text style={styles.headerTitle}>Pitchnova Sports Arena</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.headerSubtitle}>Near Fire Brigade, Bhayandar West</Text>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Venue Rules Card */}
                <TouchableOpacity style={styles.rulesCard}>
                    <View style={styles.rulesLeft}>
                        <Text style={styles.rulesTitle}>Venue Rules & Cancellation Policy</Text>
                        <Text style={styles.rulesSubtitle}>• Check cancellation terms</Text>
                        <Text style={styles.rulesSubtitle}>• Know the venue's T&Cs</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>

                {/* Slot Details */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Slot Details (02)</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllLink}>VIEW ALL</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.dateText}>18 Feb 2026</Text>

                    {bookingData.slots.map((slot, index) => (
                        <View key={index} style={styles.slotCard}>
                            <View style={styles.slotLeft}>
                                <Text style={styles.slotTime}>{slot.time}</Text>
                                <Text style={styles.slotSurface}>{slot.surface}</Text>
                                <Text style={styles.slotCourt}>{slot.court}</Text>
                            </View>
                            <View style={styles.slotRight}>
                                <Text style={styles.slotPrice}>₹{slot.price}</Text>
                                <TouchableOpacity>
                                    <Ionicons name="close-circle" size={20} color="#F44336" />
                                </TouchableOpacity>
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
                        <Text style={styles.summaryValue}>{bookingData.sport}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Slot(S) Base Price (Incl. Taxes.)</Text>
                        <Text style={styles.summaryValue}>₹{bookingData.basePrice}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Convenience Fees</Text>
                        <Text style={styles.summaryValue}>+₹{bookingData.convenienceFee}</Text>
                    </View>

                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Slot Total</Text>
                        <Text style={styles.totalValue}>₹{slotTotal}</Text>
                    </View>

                    {/* Sports Injury Insurance */}
                    <TouchableOpacity
                        style={styles.insuranceRow}
                        onPress={() => setInsuranceChecked(!insuranceChecked)}
                    >
                        <View style={styles.insuranceLeft}>
                            <MaterialCommunityIcons
                                name={insuranceChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                size={20}
                                color={insuranceChecked ? '#4CAF50' : '#999'}
                            />
                            <View style={styles.insuranceInfo}>
                                <View style={styles.insuranceTitleRow}>
                                    <Text style={styles.insuranceTitle}>Sports Injury Insurance</Text>
                                    <Ionicons name="information-circle-outline" size={16} color="#999" />
                                </View>
                                <Text style={styles.insuranceDesc}>
                                    Play safe by adding Sports Injury Insurance (Benefits upto ₹ 25,000/-) at 10.00 / Session
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.insurancePrice}>+₹{bookingData.insurance}</Text>
                    </TouchableOpacity>

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
                        <Text style={styles.termsLink}>KheloMore</Text> and{' '}
                        <Text style={styles.termsLink}>Pitchnova Sports Arena</Text>
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
    insuranceRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: SPACING.sm,
    },
    insuranceLeft: {
        flexDirection: 'row',
        flex: 1,
        gap: 10,
    },
    insuranceInfo: {
        flex: 1,
    },
    insuranceTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    insuranceTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    insuranceDesc: {
        fontSize: 11,
        color: '#666',
        lineHeight: 16,
    },
    insurancePrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
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
