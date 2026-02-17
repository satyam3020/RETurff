// Slots Screen - Browse and select time slots
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { getAvailableSlots } from '../../services/api';
import { formatDate } from '../../utils/validators';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../utils/theme';
import SlotPicker from '../../components/turf/SlotPicker';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import type { TimeSlot } from '../../types';

export default function SlotsScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSlots = async (date: Date) => {
        setLoading(true);
        setError(null);
        setSelectedSlot(null);

        const response = await getAvailableSlots(date);

        if (response.success && response.data) {
            setSlots(response.data);
        } else {
            setError(response.error || 'Failed to load slots');
        }

        setLoading(false);
    };

    useEffect(() => {
        loadSlots(selectedDate);
    }, [selectedDate]);

    const getNextDays = (count: number) => {
        const days = [];
        for (let i = 0; i < count; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleSlotSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot);
    };

    const handleContinue = () => {
        if (selectedSlot) {
            // Navigate to booking confirmation with slot data
            router.push({
                pathname: '/booking/[id]',
                params: {
                    id: selectedSlot.id,
                    date: selectedSlot.date,
                    startTime: selectedSlot.startTime,
                    endTime: selectedSlot.endTime,
                    price: selectedSlot.price.toString(),
                },
            });
        }
    };

    const nextDays = getNextDays(7);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Date Selector */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                        {nextDays.map((date, index) => {
                            const isSelected = formatDate(date) === formatDate(selectedDate);
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const dayNumber = date.getDate();
                            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                                    onPress={() => handleDateSelect(date)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                                        {dayName}
                                    </Text>
                                    <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                                        {dayNumber}
                                    </Text>
                                    <Text style={[styles.monthName, isSelected && styles.monthNameSelected]}>
                                        {monthName}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Slots */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Slots</Text>

                    {loading ? (
                        <LoadingSpinner message="Loading slots..." />
                    ) : error ? (
                        <ErrorMessage message={error} onRetry={() => loadSlots(selectedDate)} />
                    ) : slots.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>😔</Text>
                            <Text style={styles.emptyText}>No slots available for this date</Text>
                        </View>
                    ) : (
                        <SlotPicker
                            slots={slots}
                            selectedSlot={selectedSlot || undefined}
                            onSelectSlot={handleSlotSelect}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Continue Button */}
            {selectedSlot && !loading && !error && (
                <View style={styles.footer}>
                    <Button
                        title="Continue to Booking"
                        onPress={handleContinue}
                        style={styles.continueButton}
                    />
                </View>
            )}
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
    section: {
        padding: SPACING.lg,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    dateScroll: {
        marginHorizontal: -SPACING.lg,
        paddingHorizontal: SPACING.lg,
    },
    dateCard: {
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.gray300,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginRight: SPACING.sm,
        alignItems: 'center',
        minWidth: 70,
    },
    dateCardSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    dayName: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    dayNameSelected: {
        color: COLORS.white,
    },
    dayNumber: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    dayNumberSelected: {
        color: COLORS.white,
    },
    monthName: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    monthNameSelected: {
        color: COLORS.white,
    },
    emptyState: {
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    footer: {
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
    },
    continueButton: {
        width: '100%',
    },
});
