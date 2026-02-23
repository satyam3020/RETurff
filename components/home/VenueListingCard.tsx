import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';

const { width } = Dimensions.get('window');

interface Venue {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviews: number;
    pricePerHour?: number;
    price?: number;         // legacy compat
    amenities: string[];
    images: string[];
    sports?: { name: string }[];
}

export default function VenueListingCard({ venue }: { venue: Venue }) {
    const handlePress = () => {
        router.push(`/venue/${venue.id}` as any);
    };

    const imageUri = venue.images && venue.images.length > 0 ? venue.images[0] : null;
    const priceLabel = venue.pricePerHour || venue.price;
    const sportIcons: Record<string, string> = {
        Football: '⚽',
        Cricket: '🏏',
        Badminton: '🏸',
        Basketball: '🏀',
        Hockey: '🏑',
        Pickleball: '🎾',
        General: '🏃',
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
            {/* Header Info */}
            <View style={styles.header}>
                <View style={styles.titleSection}>
                    <Text style={styles.name}>{venue.name}</Text>
                    <Text style={styles.location}>{venue.location}</Text>
                </View>
                <View style={styles.ratingBadge}>
                    <MaterialCommunityIcons name="star" size={12} color="#4CAF50" />
                    <Text style={styles.ratingText}>{venue.rating} <Text style={styles.reviewText}>[{venue.reviews}]</Text></Text>
                </View>
            </View>

            {/* Image or Placeholder */}
            <View style={styles.imageContainer}>
                {imageUri ? (
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.placeholderInitial}>
                            {venue.name.charAt(0)}
                        </Text>
                        <Text style={styles.placeholderName}>{venue.name}</Text>
                    </View>
                )}

                {/* Discount Badge */}
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>20% OFF</Text>
                </View>

                {/* Price Badge */}
                {priceLabel ? (
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>₹{priceLabel}/hr</Text>
                    </View>
                ) : null}

                <View style={styles.pagination}>
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </View>

            {/* Footer Amenities & Sports */}
            <View style={styles.footer}>
                <View style={styles.amenities}>
                    <MaterialCommunityIcons name="information" size={16} color="#03A9F4" />
                    <Text style={styles.amenityText} numberOfLines={1}>
                        {venue.amenities.join(', ')}
                    </Text>
                </View>
                <View style={styles.sportIcons}>
                    {(venue.sports || []).slice(0, 3).map((s, i) => (
                        <View key={i} style={styles.sportCircle}>
                            <Text style={{ fontSize: 10 }}>{sportIcons[s.name] || '🏃'}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    titleSection: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    location: {
        fontSize: 12,
        color: '#888',
        fontWeight: '500',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    reviewText: {
        fontSize: 10,
        color: '#888',
        fontWeight: 'normal',
    },
    imageContainer: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: SPACING.md,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a2e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderInitial: {
        fontSize: 60,
        fontWeight: 'bold',
        color: 'rgba(255,87,34,0.8)',
    },
    placeholderName: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 8,
        fontWeight: '600',
    },
    discountBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#FF5722',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    discountText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: 'bold',
    },
    priceBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    priceText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    pagination: {
        position: 'absolute',
        bottom: 15,
        alignSelf: 'center',
        flexDirection: 'row',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 3,
    },
    dotActive: {
        backgroundColor: COLORS.white,
        width: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    amenities: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    amenityText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
        marginLeft: 6,
    },
    sportIcons: {
        flexDirection: 'row',
    },
    sportCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 6,
    }
});
