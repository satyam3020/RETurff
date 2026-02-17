// Turf card for displaying turf details
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../utils/theme';
import { formatPrice } from '../../utils/validators';
import Card from '../ui/Card';
import type { Turf } from '../../types';

interface TurfCardProps {
    turf: Turf;
}

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width - SPACING.lg * 2;

export default function TurfCard({ turf }: TurfCardProps) {
    return (
        <Card>
            {/* Image */}
            <Image
                source={{ uri: turf.images[0] }}
                style={styles.image}
                resizeMode="cover"
            />

            {/* Name and Rating */}
            <View style={styles.header}>
                <Text style={styles.name}>{turf.name}</Text>
                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingEmoji}>⭐</Text>
                    <Text style={styles.rating}>{turf.rating}</Text>
                </View>
            </View>

            {/* Description */}
            <Text style={styles.description} numberOfLines={2}>
                {turf.description}
            </Text>

            {/* Location */}
            <View style={styles.locationContainer}>
                <Text style={styles.locationEmoji}>📍</Text>
                <Text style={styles.location} numberOfLines={1}>
                    {turf.location}
                </Text>
            </View>

            {/* Amenities */}
            <View style={styles.amenitiesContainer}>
                {turf.amenities.slice(0, 3).map((amenity, index) => (
                    <View key={index} style={styles.amenityBadge}>
                        <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                ))}
                {turf.amenities.length > 3 && (
                    <Text style={styles.moreAmenities}>+{turf.amenities.length - 3} more</Text>
                )}
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Starting from</Text>
                <Text style={styles.price}>{formatPrice(turf.pricePerHour)}/hour</Text>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    image: {
        width: IMAGE_WIDTH - SPACING.md * 2,
        height: 200,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    name: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textPrimary,
        flex: 1,
        marginRight: SPACING.sm,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingEmoji: {
        fontSize: 16,
        marginRight: 4,
    },
    rating: {
        ...TYPOGRAPHY.bodySmall,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    description: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    locationEmoji: {
        fontSize: 16,
        marginRight: 4,
    },
    location: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textSecondary,
        flex: 1,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs,
        marginBottom: SPACING.md,
    },
    amenityBadge: {
        backgroundColor: COLORS.gray100,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs / 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    amenityText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
    },
    moreAmenities: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary,
        alignSelf: 'center',
    },
    priceContainer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
        paddingTop: SPACING.md,
        alignItems: 'center',
    },
    priceLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    price: {
        ...TYPOGRAPHY.h2,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});
