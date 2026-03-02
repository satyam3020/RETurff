import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    FlatList,
    ViewToken,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';
import { userApi } from '../../services/api';

const { width } = Dimensions.get('window');
const CARD_MARGIN = SPACING.md;
const IMAGE_WIDTH = width - CARD_MARGIN * 2;

// Default turf images shown when backend provides none
const DEFAULT_TURF_IMAGES = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
];

// Amenity → icon mapping (MaterialCommunityIcons)
const AMENITY_ICONS: Record<string, { icon: string; color: string }> = {
    Parking: { icon: 'car', color: '#4CAF50' },
    Floodlights: { icon: 'lightbulb-on', color: '#FFA000' },
    'Flood Lights': { icon: 'lightbulb-on', color: '#FFA000' },
    Washroom: { icon: 'human-male-female', color: '#2196F3' },
    'Changing Room': { icon: 'tshirt-crew', color: '#FF7043' },
    'First Aid': { icon: 'medical-bag', color: '#E53935' },
    Canteen: { icon: 'food', color: '#8BC34A' },
    'Drinking Water': { icon: 'cup-water', color: '#03A9F4' },
    WiFi: { icon: 'wifi', color: '#7C4DFF' },
    Seating: { icon: 'seat', color: '#795548' },
    Scoreboard: { icon: 'scoreboard', color: '#607D8B' },
    'Artificial Turf': { icon: 'grass', color: '#66BB6A' },
};

// Sport → emoji icon mapping
const SPORT_ICONS: Record<string, string> = {
    Football: '⚽',
    Cricket: '🏏',
    Badminton: '🏸',
    Basketball: '🏀',
    Hockey: '🏑',
    Pickleball: '🎾',
    Tennis: '🎾',
    General: '🏃',
};

interface Venue {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviews: number;
    pricePerHour?: number;
    price?: number;
    amenities: string[];
    images: string[];
    sports?: { name: string }[];
}

interface Props {
    venue: Venue;
    isFavourite?: boolean;
    onToggleFavourite?: (venueId: string, newState: boolean) => void;
}

export default function VenueListingCard({ venue, isFavourite = false, onToggleFavourite }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [localFav, setLocalFav] = useState(isFavourite);
    const flatListRef = useRef<FlatList>(null);

    const handlePress = () => {
        router.push(`/venue/${venue.id}` as any);
    };

    const images =
        venue.images && venue.images.length > 0 ? venue.images : DEFAULT_TURF_IMAGES;
    const priceLabel = venue.pricePerHour || venue.price;

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index != null) {
                setActiveIndex(viewableItems[0].index);
            }
        },
        [],
    );

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;

    const renderImageItem = ({ item }: { item: string }) => (
        <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
    );

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.95}>
            {/* ──── Header ──── */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.venueName}>{venue.name}</Text>
                    <View style={styles.ratingBadge}>
                        <MaterialCommunityIcons name="star" size={14} color="#388E3C" />
                        <Text style={styles.ratingValue}> {venue.rating}</Text>
                        <Text style={styles.reviewCount}> ({venue.reviews} reviews)</Text>
                    </View>
                </View>

                {/* Sport tags */}
                {venue.sports && venue.sports.length > 0 && (
                    <View style={styles.sportTagRow}>
                        {venue.sports.slice(0, 4).map((s, i) => (
                            <View key={i} style={styles.sportTag}>
                                <Text style={styles.sportTagIcon}>
                                    {SPORT_ICONS[s.name] || '🏃'}
                                </Text>
                                <Text style={styles.sportTagLabel}>{s.name} Turf</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Location */}
                <View style={styles.locationRow}>
                    <Ionicons name="location-sharp" size={14} color="#FF5722" />
                    <Text style={styles.locationText}>{venue.location}</Text>
                </View>
            </View>

            {/* ──── Image Carousel ──── */}
            <View style={styles.imageContainer}>
                {images.length > 0 ? (
                    <FlatList
                        ref={flatListRef}
                        data={images}
                        renderItem={renderImageItem}
                        keyExtractor={(item, index) => `${venue.id}-img-${index}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={IMAGE_WIDTH}
                        decelerationRate="fast"
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        getItemLayout={(_, index) => ({
                            length: IMAGE_WIDTH,
                            offset: IMAGE_WIDTH * index,
                            index,
                        })}
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.placeholderInitial}>
                            {venue.name.charAt(0)}
                        </Text>
                    </View>
                )}

                {/* Discount badge — top-left */}
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>20% OFF</Text>
                </View>

                {/* Favourite heart — top-right */}
                <TouchableOpacity
                    style={styles.heartButton}
                    onPress={(e) => {
                        e.stopPropagation?.();
                        const newState = !localFav;
                        setLocalFav(newState);
                        userApi.toggleFavourite(venue.id).catch(() => setLocalFav(!newState));
                        onToggleFavourite?.(venue.id, newState);
                    }}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                    <Ionicons
                        name={localFav ? 'heart' : 'heart-outline'}
                        size={22}
                        color={localFav ? '#FF5252' : '#fff'}
                    />
                </TouchableOpacity>

                {/* Price overlay — bottom-right */}
                {priceLabel ? (
                    <View style={styles.priceOverlay}>
                        <Text style={styles.priceOverlayLabel}>Starting from</Text>
                        <Text style={styles.priceOverlayValue}>₹{priceLabel}/hr</Text>
                    </View>
                ) : null}

                {/* Pagination dots */}
                {images.length > 1 && (
                    <View style={styles.pagination}>
                        {images.map((_, i) => (
                            <View
                                key={i}
                                style={[styles.dot, activeIndex === i && styles.dotActive]}
                            />
                        ))}
                    </View>
                )}
            </View>

            {/* ──── Amenities Row ──── */}
            {venue.amenities && venue.amenities.length > 0 && (
                <View style={styles.amenitiesRow}>
                    {venue.amenities.slice(0, 4).map((amenity, i) => {
                        const mapping = AMENITY_ICONS[amenity];
                        return (
                            <View key={i} style={styles.amenityChip}>
                                {mapping ? (
                                    <MaterialCommunityIcons
                                        name={mapping.icon as any}
                                        size={16}
                                        color={mapping.color}
                                    />
                                ) : (
                                    <MaterialCommunityIcons
                                        name="check-circle"
                                        size={16}
                                        color="#4CAF50"
                                    />
                                )}
                                <Text style={styles.amenityChipText}>{amenity}</Text>
                            </View>
                        );
                    })}
                </View>
            )}

            {/* ──── Price + Book Now ──── */}
            <View style={styles.bottomSection}>
                {priceLabel ? (
                    <View style={styles.priceRow}>
                        <View style={styles.greenDot} />
                        <Text style={styles.priceLineText}>
                            Starting from{' '}
                            <Text style={styles.priceLineBold}>₹{priceLabel}/hr</Text>
                        </Text>
                    </View>
                ) : null}

                <TouchableOpacity style={styles.bookButton} onPress={handlePress} activeOpacity={0.85}>
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    /* ── Card ── */
    card: {
        backgroundColor: COLORS.white,
        marginHorizontal: CARD_MARGIN,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        // shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },

    /* ── Header ── */
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    venueName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1a1a',
        letterSpacing: 0.3,
        flex: 1,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#388E3C',
    },
    reviewCount: {
        fontSize: 12,
        color: '#888',
        fontWeight: '400',
    },

    /* Sport tags */
    sportTagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 6,
        gap: 8,
    },
    sportTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    sportTagIcon: {
        fontSize: 13,
        marginRight: 4,
    },
    sportTagLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2E7D32',
    },

    /* Location */
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        fontSize: 13,
        color: '#777',
        marginLeft: 4,
        fontWeight: '500',
    },

    /* ── Image ── */
    imageContainer: {
        width: IMAGE_WIDTH,
        height: 200,
        overflow: 'hidden',
    },
    carouselImage: {
        width: IMAGE_WIDTH,
        height: 200,
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

    /* Discount badge */
    discountBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#FF5722',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    discountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    /* Heart button */
    heartButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* Price overlay on image */
    priceOverlay: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'flex-end',
    },
    priceOverlayLabel: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 10,
        fontWeight: '500',
    },
    priceOverlayValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },

    /* Pagination */
    pagination: {
        position: 'absolute',
        bottom: 14,
        alignSelf: 'center',
        flexDirection: 'row',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.45)',
        marginHorizontal: 3,
    },
    dotActive: {
        backgroundColor: '#fff',
        width: 16,
        borderRadius: 4,
    },

    /* ── Amenities ── */
    amenitiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingTop: 14,
        gap: 8,
    },
    amenityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e8e8e8',
    },
    amenityChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#444',
        marginLeft: 6,
    },

    /* ── Bottom Section ── */
    bottomSection: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 8,
    },
    priceLineText: {
        fontSize: 14,
        color: '#555',
        fontWeight: '500',
    },
    priceLineBold: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1a1a1a',
    },

    /* Book Now button */
    bookButton: {
        backgroundColor: '#FF9800',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
