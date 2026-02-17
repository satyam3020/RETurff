// Slot picker component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../utils/theme';
import { formatPrice } from '../../utils/validators';
import type { TimeSlot } from '../../types';

interface SlotPickerProps {
    slots: TimeSlot[];
    selectedSlot?: TimeSlot;
    onSelectSlot: (slot: TimeSlot) => void;
}

export default function SlotPicker({ slots, selectedSlot, onSelectSlot }: SlotPickerProps) {
    const renderSlot = ({ item }: { item: TimeSlot }) => {
        const isSelected = selectedSlot?.id === item.id;
        const isDisabled = !item.isAvailable;

        return (
            <TouchableOpacity
                style={[
                    styles.slot,
                    isSelected && styles.slotSelected,
                    isDisabled && styles.slotDisabled,
                ]}
                onPress={() => item.isAvailable && onSelectSlot(item)}
                disabled={isDisabled}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.slotTime,
                        isSelected && styles.slotTimeSelected,
                        isDisabled && styles.slotTimeDisabled,
                    ]}
                >
                    {item.startTime}
                </Text>
                <Text
                    style={[
                        styles.slotPrice,
                        isSelected && styles.slotPriceSelected,
                        isDisabled && styles.slotPriceDisabled,
                    ]}
                >
                    {isDisabled ? 'Booked' : formatPrice(item.price)}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <FlatList
            data={slots}
            renderItem={renderSlot}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: SPACING.sm,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    slot: {
        flex: 1,
        marginHorizontal: SPACING.xs / 2,
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.gray300,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        alignItems: 'center',
        minHeight: 70,
        justifyContent: 'center',
    },
    slotSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    slotDisabled: {
        backgroundColor: COLORS.gray100,
        borderColor: COLORS.gray200,
        opacity: 0.6,
    },
    slotTime: {
        ...TYPOGRAPHY.bodySmall,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    slotTimeSelected: {
        color: COLORS.white,
    },
    slotTimeDisabled: {
        color: COLORS.textDisabled,
    },
    slotPrice: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    slotPriceSelected: {
        color: COLORS.white,
    },
    slotPriceDisabled: {
        color: COLORS.textDisabled,
    },
});
