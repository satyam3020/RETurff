// Booking Confirmation Screen
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { createBooking, getTurfDetails } from '../../services/api';
import { getUserProfile, saveUserProfile } from '../../services/storage';
import { validateBookingForm, formatPrice } from '../../utils/validators';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../utils/theme';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { User, Turf } from '../../types';

export default function BookingConfirmationScreen() {
    const params = useLocalSearchParams();
    const { date, startTime, endTime, price } = params as {
        date: string;
        startTime: string;
        endTime: string;
        price: string;
    };

    const [turf, setTurf] = useState<Turf | null>(null);
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Load user profile and turf details
    useEffect(() => {
        const loadData = async () => {
            const profile = await getUserProfile();
            if (profile) {
                setUserName(profile.name);
                setUserPhone(profile.phone);
            }

            const turfResponse = await getTurfDetails();
            if (turfResponse.success && turfResponse.data) {
                setTurf(turfResponse.data);
            }

            setInitialLoading(false);
        };

        loadData();
    }, []);

    const handleConfirmBooking = async () => {
        // Validate form
        const validationErrors = validateBookingForm({
            date: new Date(date),
            slotId: params.id as string,
            userName,
            userPhone,
        });

        if (validationErrors.length > 0) {
            const errorMap: Record<string, string> = {};
            validationErrors.forEach((err) => {
                errorMap[err.field] = err.message;
            });
            setErrors(errorMap);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            // Save user profile
            const user: User = { name: userName, phone: userPhone };
            await saveUserProfile(user);

            // Create booking
            const response = await createBooking({
                turfId: turf?.id || 'turf-001',
                turfName: turf?.name || 'Green Valley Sports Arena',
                date,
                startTime,
                endTime,
                duration: 1,
                totalPrice: parseFloat(price),
                status: 'upcoming',
                userName,
                userPhone,
            });

            if (response.success) {
                Alert.alert(
                    'Success!',
                    SUCCESS_MESSAGES.BOOKING_CREATED,
                    [
                        {
                            text: 'View My Bookings',
                            onPress: () => router.replace('/bookings'),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', response.error || ERROR_MESSAGES.CREATE_BOOKING_ERROR);
            }
        } catch (error) {
            Alert.alert('Error', ERROR_MESSAGES.CREATE_BOOKING_ERROR);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <LoadingSpinner message="Loading..." />;
    }

    const totalPrice = parseFloat(price);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Booking Summary */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Booking Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Turf</Text>
                        <Text style={styles.summaryValue}>{turf?.name || 'Loading...'}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Date</Text>
                        <Text style={styles.summaryValue}>{date}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Time</Text>
                        <Text style={styles.summaryValue}>{startTime} - {endTime}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Duration</Text>
                        <Text style={styles.summaryValue}>1 hour</Text>
                    </View>

                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
                    </View>
                </Card>

                {/* User Details */}
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Your Details</Text>

                    <Input
                        label="Full Name"
                        value={userName}
                        onChangeText={setUserName}
                        placeholder="Enter your name"
                        error={errors.name}
                    />

                    <Input
                        label="Phone Number"
                        value={userPhone}
                        onChangeText={setUserPhone}
                        placeholder="10-digit mobile number"
                        keyboardType="phone-pad"
                        maxLength={10}
                        error={errors.phone}
                    />
                </Card>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Button
                    title="Confirm Booking"
                    onPress={handleConfirmBooking}
                    loading={loading}
                    disabled={loading}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    card: {
        marginBottom: SPACING.lg,
    },
    cardTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
    },
    summaryLabel: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        ...TYPOGRAPHY.body,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    totalRow: {
        borderBottomWidth: 0,
        paddingTop: SPACING.md,
        marginTop: SPACING.sm,
    },
    totalLabel: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
    },
    totalValue: {
        ...TYPOGRAPHY.h2,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    footer: {
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
    },
});
