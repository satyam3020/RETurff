import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';

const { width } = Dimensions.get('window');

// Mock venue data
const VENUE_DATA = {
    id: '1',
    name: 'Pitchnova Sports Arena',
    price: '₹200 Onwards',
    timings: '6:00 AM - 11:59 PM',
    address: 'Pitchnova Sports Arena, Maheshwari Bhawan road, Bhayandar West, Near Fire Brigade, Mumbai - 401101',
    rating: 5,
    reviews: 2,
    images: [
        'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800',
        'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800',
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',
    ],
    sports: [
        { id: '1', name: 'Box Cricket', icon: 'cricket', surface: 'Astro Turf' },
        { id: '2', name: 'Football', icon: 'soccer', surface: 'Astro Turf' },
        { id: '3', name: 'Pickleball', icon: 'tennis', surface: '8 layered Acrylic Surface' },
    ],
    about: 'Pitchnova Sports Arena offers a premium multi-sport experience with one of the largest turfs in the area, designed to host both cricket and 7v7 football. The arena also features two dedicated pickleball courts, providing players with a modern, well-maintained, and comfortable environment for practice training sessions, and competitive play. It\'s the perfect destination for teams, sports enthusiasts, and community events.',
    offers: [
        'Flat 30% off upto Rs.70',
        'Get 20% off upto Rs.70',
    ],
    facilities: [
        'Artificial Turf',
        'Drinking Water',
        'Flood lights',
        'Parking',
        'Cafe',
        'Changing room',
        'First Aid',
        'Washroom',
    ],
};

export default function VenueDetailsScreen() {
    const params = useLocalSearchParams();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showSportModal, setShowSportModal] = useState(false);

    const handleSelectSport = (sport: any) => {
        router.push(`/venue/${params.id}/booking?sport=${sport.id}&surface=${encodeURIComponent(sport.surface)}` as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Venue Details</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="heart-outline" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="share-social-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Image Carousel */}
                <View style={styles.imageCarousel}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setCurrentImageIndex(index);
                        }}
                        scrollEventThrottle={16}
                    >
                        {VENUE_DATA.images.map((image, index) => (
                            <Image key={index} source={{ uri: image }} style={styles.carouselImage} />
                        ))}
                    </ScrollView>
                    <View style={styles.imageDots}>
                        {VENUE_DATA.images.map((_, index) => (
                            <View
                                key={index}
                                style={[styles.dot, currentImageIndex === index && styles.activeDot]}
                            />
                        ))}
                    </View>
                </View>

                {/* Venue Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.venueName}>{VENUE_DATA.name}</Text>
                    <Text style={styles.priceTimings}>
                        {VENUE_DATA.price} • {VENUE_DATA.timings}
                    </Text>

                    <View style={styles.addressContainer}>
                        <Ionicons name="location" size={16} color="#666" />
                        <Text style={styles.addressText}>{VENUE_DATA.address}</Text>
                    </View>
                    <TouchableOpacity>
                        <Text style={styles.viewMapLink}>VIEW ON MAPS</Text>
                    </TouchableOpacity>

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                        <View style={styles.ratingBadge}>
                            <MaterialCommunityIcons name="star" size={16} color="#4CAF50" />
                            <Text style={styles.ratingText}>{VENUE_DATA.rating}</Text>
                            <Text style={styles.reviewsText}>{VENUE_DATA.reviews} ratings</Text>
                        </View>
                        <TouchableOpacity style={styles.rateButton}>
                            <Text style={styles.rateButtonText}>RATE VENUE</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Available Sports */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Sports</Text>
                    <View style={styles.sportsChips}>
                        {VENUE_DATA.sports.map((sport) => (
                            <View key={sport.id} style={styles.sportChip}>
                                <MaterialCommunityIcons name={sport.icon as any} size={18} color="#666" />
                                <Text style={styles.sportChipText}>{sport.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About This Venue</Text>
                    <Text style={styles.aboutText}>{VENUE_DATA.about}</Text>
                </View>

                {/* Offers */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Offers</Text>
                    {VENUE_DATA.offers.map((offer, index) => (
                        <View key={index} style={styles.offerItem}>
                            <MaterialCommunityIcons name="brightness-percent" size={20} color="#FF5722" />
                            <Text style={styles.offerText}>{offer}</Text>
                        </View>
                    ))}
                    <TouchableOpacity>
                        <Text style={styles.viewDetailsLink}>VIEW COUPON DETAILS</Text>
                    </TouchableOpacity>
                </View>

                {/* Venue Rules */}
                <TouchableOpacity style={styles.rulesCard}>
                    <View style={styles.rulesLeft}>
                        <Text style={styles.rulesTitle}>Venue Rules</Text>
                        <Text style={styles.rulesSubtitle}>EASY CANCELLATION & RESCHEDULING</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>

                {/* Facilities */}
                <View style={styles.section}>
                    <View style={styles.facilitiesHeader}>
                        <Text style={styles.sectionTitle}>Facilities ({VENUE_DATA.facilities.length})</Text>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                </View>

                {/* Amenities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    {VENUE_DATA.facilities.slice(0, 4).map((facility, index) => (
                        <View key={index} style={styles.amenityItem}>
                            <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#4CAF50" />
                            <Text style={styles.amenityText}>{facility}</Text>
                        </View>
                    ))}
                    <TouchableOpacity>
                        <Text style={styles.seeAllLink}>SEE ALL ({VENUE_DATA.facilities.length})</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.proceedButton}
                    onPress={() => setShowSportModal(true)}
                >
                    <Text style={styles.proceedButtonText}>SELECT A SPORT TO PROCEED</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {/* Sport Selection Modal */}
            {showSportModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select a Sport</Text>
                            <TouchableOpacity onPress={() => setShowSportModal(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {VENUE_DATA.sports.map((sport) => (
                            <TouchableOpacity
                                key={sport.id}
                                style={styles.sportOption}
                                onPress={() => {
                                    setShowSportModal(false);
                                    handleSelectSport(sport);
                                }}
                            >
                                <View style={styles.sportOptionLeft}>
                                    <MaterialCommunityIcons name={sport.icon as any} size={32} color="#333" />
                                    <View style={styles.sportOptionInfo}>
                                        <Text style={styles.sportOptionName}>{sport.name}</Text>
                                        <Text style={styles.sportOptionSurface}>{sport.surface}</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.modalProceedButton}
                            onPress={() => setShowSportModal(false)}
                        >
                            <Text style={styles.modalProceedButtonText}>SELECT A SPORT TO PROCEED</Text>
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
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    imageCarousel: {
        height: 200,
        position: 'relative',
    },
    carouselImage: {
        width: width,
        height: 200,
        resizeMode: 'cover',
    },
    imageDots: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    activeDot: {
        backgroundColor: COLORS.white,
        width: 20,
    },
    infoSection: {
        padding: SPACING.lg,
        borderBottomWidth: 8,
        borderBottomColor: '#f5f5f5',
    },
    venueName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    priceTimings: {
        fontSize: 14,
        color: '#666',
        marginBottom: SPACING.md,
    },
    addressContainer: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 6,
    },
    addressText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    viewMapLink: {
        fontSize: 13,
        color: '#FF5722',
        fontWeight: '600',
        marginBottom: SPACING.md,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.sm,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    reviewsText: {
        fontSize: 12,
        color: '#666',
    },
    rateButton: {
        borderWidth: 1,
        borderColor: '#FF5722',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 6,
    },
    rateButtonText: {
        fontSize: 12,
        color: '#FF5722',
        fontWeight: '600',
    },
    section: {
        padding: SPACING.lg,
        borderBottomWidth: 8,
        borderBottomColor: '#f5f5f5',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: SPACING.md,
    },
    sportsChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    sportChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    sportChipText: {
        fontSize: 13,
        color: '#333',
    },
    aboutText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    offerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: SPACING.sm,
    },
    offerText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    viewDetailsLink: {
        fontSize: 13,
        color: '#03A9F4',
        fontWeight: '600',
        marginTop: SPACING.sm,
    },
    rulesCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E3F2FD',
        padding: SPACING.lg,
        marginHorizontal: SPACING.lg,
        marginVertical: SPACING.md,
        borderRadius: 8,
    },
    rulesLeft: {
        flex: 1,
    },
    rulesTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    rulesSubtitle: {
        fontSize: 11,
        color: '#4CAF50',
        fontWeight: '600',
    },
    facilitiesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: SPACING.sm,
    },
    amenityText: {
        fontSize: 14,
        color: '#333',
    },
    seeAllLink: {
        fontSize: 13,
        color: '#03A9F4',
        fontWeight: '600',
        marginTop: SPACING.sm,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    proceedButton: {
        backgroundColor: '#FF5722',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    proceedButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: SPACING.lg,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    sportOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sportOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sportOptionInfo: {
        gap: 4,
    },
    sportOptionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    sportOptionSurface: {
        fontSize: 13,
        color: '#666',
    },
    modalProceedButton: {
        backgroundColor: '#E0E0E0',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: SPACING.lg,
    },
    modalProceedButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#999',
    },
});
