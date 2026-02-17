import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, SPACING } from '../../utils/theme';

const { width } = Dimensions.get('window');

interface Venue {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviews: number;
    price: number;
    amenities: string[];
    images: string[];
}

export default function VenueListingCard({ venue }: { venue: Venue }) {
    return (
        <View style={styles.container}>
            {/* Header Info */}
            <View style={styles.header}>
                <View style={styles.titleSection}>
                    <Text style={styles.name}>{venue.name}</Text>
                    <Text style={styles.location}>{venue.location}</Text>
                </View>
                <View style={styles.ratingBadge}>
                    <Text style={styles.starText}>⭐</Text>
                    <Text style={styles.ratingText}>{venue.rating} <Text style={styles.reviewText}>[{venue.reviews}]</Text></Text>
                </View>
            </View>

            {/* Image Slider Mockup */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: venue.images[0] }} style={styles.image} />
                <View style={styles.pagination}>
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </View>

            {/* Footer Amenities & Booking */}
            <View style={styles.footer}>
                <View style={styles.amenities}>
                    <Text style={styles.amenityIcon}>🏢</Text>
                    <Text style={styles.amenityText} numberOfLines={1}>
                        {venue.amenities.join(', ')}
                    </Text>
                </View>
                <View style={styles.sportIcons}>
                    {/* Mock icons for sports */}
                    <View style={styles.sportCircle}><Text style={{ fontSize: 10 }}>⚽</Text></View>
                    <View style={styles.sportCircle}><Text style={{ fontSize: 10 }}>🏸</Text></View>
                </View>
            </View>
        </View>
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
    starText: {
        fontSize: 10,
        marginRight: 4,
        color: '#4CAF50',
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
    amenityIcon: {
        fontSize: 16,
        marginRight: 8,
        color: '#03A9F4',
    },
    amenityText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
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
