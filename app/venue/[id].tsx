import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Linking,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, SPACING } from '../../utils/theme';
import { getTurfDetails, getVenuePitches } from '../../services/api';

const { width } = Dimensions.get('window');

// Sport icon map
const SPORT_ICONS: Record<string, string> = {
    Football: 'soccer',
    Cricket: 'cricket',
    Badminton: 'badminton',
    Basketball: 'basketball',
    Hockey: 'hockey-sticks',
    Pickleball: 'tennis',
    General: 'run',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800';

// ─── Static fallback data for RETurf (used when backend is unavailable) ──────
const STATIC_RETURF_VENUE = {
    _id: 'returf-static-1',
    id: 'returf-static-1',
    name: 'RETurf',
    description: 'RETurf is a premier multi-sport arena offering world-class facilities for Cricket and Football. State-of-the-art synthetic turf, professional flood lights, and a comfortable viewing area make it the perfect destination for sports enthusiasts.',
    location: {
        address: 'Mumbai, Maharashtra',
        coordinates: { lat: 19.0760, lng: 72.8777 }, // Mumbai coordinates
    },
    pricePerHour: 200,
    images: [
        'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800',
        'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800',
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',
    ],
    sports: [
        { _id: 's1', name: 'Cricket', surface: 'Astro Turf', pitches: ['Pitch 1', 'Pitch 2'] },
        { _id: 's2', name: 'Football', surface: 'Astro Turf', pitches: ['Pitch 1', 'Pitch 2'] },
    ],
    amenities: ['Artificial Turf', 'Flood Lights', 'Parking', 'Changing Room', 'Drinking Water', 'First Aid', 'Washroom'],
    rating: 4.8,
    totalReviews: 124,
};

export default function VenueDetailsScreen() {
    const params = useLocalSearchParams();
    const venueId = params.id as string;

    const [venue, setVenue] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showSportModal, setShowSportModal] = useState(false);
    const [selectedSport, setSelectedSport] = useState<any>(null); // for pitch sub-selection
    const [dynamicPitches, setDynamicPitches] = useState<string[]>([]);
    const [pitchesLoading, setPitchesLoading] = useState(false);
    const [rulesExpanded, setRulesExpanded] = useState(false);

    const loadVenue = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Short-circuit for the static RETurf venue (no backend needed)
            if (venueId === 'returf-static-1') {
                setVenue(STATIC_RETURF_VENUE);
                setLoading(false);
                return;
            }
            const res = await getTurfDetails(venueId);
            if (res.success && res.data) {
                setVenue(res.data);
            } else {
                // Fallback to static venue if backend fails
                setVenue(STATIC_RETURF_VENUE);
            }
        } catch (e) {
            // Fallback to static venue on network error
            setVenue(STATIC_RETURF_VENUE);
        } finally {
            setLoading(false);
        }
    }, [venueId]);

    useEffect(() => { loadVenue(); }, [loadVenue]);

    // Level 1 — user picked a sport, now dynamically fetch pitches from backend
    const handlePickSport = async (sport: any) => {
        setSelectedSport(sport);
        setPitchesLoading(true);
        setDynamicPitches([]);
        try {
            const res = await getVenuePitches(venueId, sport.name);
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                setDynamicPitches(res.data);
            } else {
                // Fallback: use static pitches from venue data if backend returns none
                const staticPitches: string[] = sport.pitches || [];
                setDynamicPitches(staticPitches);
            }
        } catch {
            const staticPitches: string[] = sport.pitches || [];
            setDynamicPitches(staticPitches);
        } finally {
            setPitchesLoading(false);
        }
    };

    // Level 2 — user picked a pitch
    const handlePickPitch = (pitchName: string) => {
        navigateToBooking(selectedSport.name, pitchName);
    };

    const navigateToBooking = (sportName: string, surface: string) => {
        setShowSportModal(false);
        setSelectedSport(null);
        router.push({
            pathname: `/venue/${venueId}/booking` as any,
            params: {
                id: venueId,
                venueName: venue?.name || '',
                venueLocation: venue?.location?.address || venue?.location || '',
                sport: sportName,
                surface,
            },
        });
    };

    const closeModal = () => {
        setShowSportModal(false);
        setSelectedSport(null);
        setDynamicPitches([]);
    };

    // ── Open in native Maps app ──────────────────────────────────────────────
    const openInMaps = () => {
        const lat = venue?.location?.coordinates?.lat;
        const lng = venue?.location?.coordinates?.lng;
        const label = encodeURIComponent(venue?.name || 'Turf');
        let url: string;
        if (lat && lng) {
            url = Platform.OS === 'ios'
                ? `maps:0,0?q=${label}@${lat},${lng}`
                : `geo:${lat},${lng}?q=${lat},${lng}(${label})`;
        } else {
            const query = encodeURIComponent(venue?.location?.address || venue?.location || label);
            url = Platform.OS === 'ios'
                ? `maps:0,0?q=${query}`
                : `geo:0,0?q=${query}`;
        }
        Linking.openURL(url).catch(() => {
            // Fallback to Google Maps web
            const q = lat && lng ? `${lat},${lng}` : encodeURIComponent(venue?.location?.address || venue?.name || '');
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
        });
    };

    // ── Loading / Error states ───────────────────────────────────────────────
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#FF5722" />
                <Text style={styles.loadingText}>Loading venue...</Text>
            </View>
        );
    }

    if (error || !venue) {
        return (
            <View style={styles.centered}>
                <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
                <Text style={styles.errorText}>{error || 'Venue not found'}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadVenue}>
                    <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Normalize data from backend ──────────────────────────────────────────
    const images: string[] = (venue.images && venue.images.length) ? venue.images : [FALLBACK_IMAGE];
    const sports: any[] = venue.sports || [];
    const amenities: string[] = venue.amenities || [];
    const address: string = venue.location?.address || venue.location || '';
    const priceLabel = venue.pricePerHour ? `₹${venue.pricePerHour}/hr onwards` : '';
    const description: string = venue.description || '';

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
                        {images.map((image, index) => (
                            <Image key={index} source={{ uri: image }} style={styles.carouselImage} />
                        ))}
                    </ScrollView>
                    <View style={styles.imageDots}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[styles.dot, currentImageIndex === index && styles.activeDot]}
                            />
                        ))}
                    </View>
                </View>

                {/* Venue Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.venueName}>{venue.name}</Text>
                    {!!priceLabel && (
                        <Text style={styles.priceTimings}>{priceLabel}</Text>
                    )}

                    {!!address && (
                        <View style={styles.addressContainer}>
                            <Ionicons name="location" size={16} color="#666" />
                            <Text style={styles.addressText}>{address}</Text>
                        </View>
                    )}

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                        <View style={styles.ratingBadge}>
                            <MaterialCommunityIcons name="star" size={16} color="#4CAF50" />
                            <Text style={styles.ratingText}>{venue.rating ?? '4.5'}</Text>
                            <Text style={styles.reviewsText}>{venue.totalReviews ?? 0} ratings</Text>
                        </View>
                        <TouchableOpacity style={styles.rateButton}>
                            <Text style={styles.rateButtonText}>RATE VENUE</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Available Sports */}
                {sports.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Sports</Text>
                        <View style={styles.sportsChips}>
                            {sports.map((sport, i) => (
                                <View key={sport._id || i} style={styles.sportChip}>
                                    <MaterialCommunityIcons
                                        name={(SPORT_ICONS[sport.name] || 'run') as any}
                                        size={18}
                                        color="#666"
                                    />
                                    <Text style={styles.sportChipText}>{sport.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* About */}
                {!!description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About This Venue</Text>
                        <Text style={styles.aboutText}>{description}</Text>
                    </View>
                )}

                {/* Venue Rules — Expandable Accordion */}
                <View style={styles.rulesSection}>
                    <TouchableOpacity style={styles.rulesCard} onPress={() => setRulesExpanded(!rulesExpanded)}>
                        <View style={styles.rulesLeft}>
                            <View style={styles.rulesTitleRow}>
                                <MaterialCommunityIcons name="clipboard-text-outline" size={20} color="#FF5722" />
                                <Text style={styles.rulesTitle}>Venue Rules</Text>
                            </View>
                            {!rulesExpanded && (
                                <Text style={styles.rulesSubtitle}>EASY CANCELLATION & RESCHEDULING</Text>
                            )}
                        </View>
                        <Ionicons name={rulesExpanded ? 'chevron-down' : 'chevron-forward'} size={20} color="#666" />
                    </TouchableOpacity>

                    {rulesExpanded && (
                        <View style={styles.rulesContent}>
                            {/* Rules */}
                            <Text style={styles.rulesHeading}>Rules</Text>
                            <Text style={styles.ruleText}>Wear appropriate sports attire and shoes while playing.</Text>
                            <Text style={styles.ruleText}>Be present at the venue 10 mins prior to the booked slot.</Text>
                            <Text style={styles.ruleText}>Management is not responsible for loss of personal belongings or any injuries caused during the match.</Text>
                            <Text style={styles.ruleText}>If more than 18 players on one pitch, it will be counted as a tournament and rates will be different.</Text>
                            <Text style={styles.ruleText}>No water and food allowed from outside. Additional royalty charges applicable if any water or food is got from Outside.</Text>
                            <Text style={styles.ruleText}>Additional royalty charges applicable on DJ and Sound or live YouTube.</Text>
                            <Text style={styles.ruleText}>Additional electricity charges applicable if any equipment got by the customers consumes electricity.</Text>
                            <Text style={styles.ruleText}>Please Carry Your Football or Cricket Bats.</Text>
                            <Text style={styles.ruleText}>Event and tournament charges will be different which will be given as a separate quotation. Pls contact site manager for the same.</Text>
                            <Text style={[styles.ruleText, { color: '#999', fontStyle: 'italic' }]}>Anyone who wants to divide the turf, whether horizontally or vertically, may do so.</Text>

                            {/* Additional T&C */}
                            <Text style={[styles.rulesHeading, { marginTop: 20 }]}>Additional Terms & Conditions</Text>
                            <Text style={styles.ruleText}>No Smoking</Text>
                            <Text style={styles.ruleText}>No Drinking</Text>

                            {/* Cancellation Policy */}
                            <Text style={[styles.rulesHeading, { marginTop: 20 }]}>Cancellation policy</Text>
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

                {/* Amenities */}
                {amenities.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.facilitiesHeader}>
                            <Text style={styles.sectionTitle}>Amenities ({amenities.length})</Text>
                        </View>
                        {amenities.slice(0, 4).map((item, index) => (
                            <View key={index} style={styles.amenityItem}>
                                <MaterialCommunityIcons name="checkbox-marked-circle" size={18} color="#4CAF50" />
                                <Text style={styles.amenityText}>{item}</Text>
                            </View>
                        ))}
                        {amenities.length > 4 && (
                            <TouchableOpacity>
                                <Text style={styles.seeAllLink}>SEE ALL ({amenities.length})</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* ── Google Map Section ── */}
                {(() => {
                    const lat = venue?.location?.coordinates?.lat;
                    const lng = venue?.location?.coordinates?.lng;
                    const hasCoords = lat && lng;
                    return (
                        <View style={styles.mapSection}>
                            <Text style={styles.sectionTitle}>Location</Text>
                            {!!address && (
                                <View style={styles.mapAddressRow}>
                                    <Ionicons name="location" size={14} color="#FF5722" />
                                    <Text style={styles.mapAddressText}>{address}</Text>
                                </View>
                            )}
                            {hasCoords ? (
                                <MapView
                                    style={styles.map}
                                    provider={PROVIDER_GOOGLE}
                                    initialRegion={{
                                        latitude: lat,
                                        longitude: lng,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                    pitchEnabled={false}
                                    rotateEnabled={false}
                                >
                                    <Marker
                                        coordinate={{ latitude: lat, longitude: lng }}
                                        title={venue.name}
                                        description={address}
                                        pinColor="#FF5722"
                                    />
                                </MapView>
                            ) : (
                                <View style={styles.mapPlaceholder}>
                                    <Ionicons name="map-outline" size={36} color="#ccc" />
                                    <Text style={styles.mapPlaceholderText}>Map not available</Text>
                                </View>
                            )}
                            <TouchableOpacity style={styles.openMapsBtn} onPress={openInMaps}>
                                <Ionicons name="navigate" size={16} color="#fff" />
                                <Text style={styles.openMapsBtnText}>Open in Google Maps</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })()}

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

            {/* ── Sport / Pitch Selection Modal (2-level) ── */}
            {showSportModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>

                        {/* ── Level 1: Sport list ─────────────────── */}
                        {!selectedSport ? (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Select a Sport</Text>
                                    <TouchableOpacity onPress={closeModal}>
                                        <Ionicons name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                {sports.map((sport, i) => (
                                    <TouchableOpacity
                                        key={sport._id || i}
                                        style={styles.sportOption}
                                        onPress={() => handlePickSport(sport)}
                                    >
                                        <View style={styles.sportOptionLeft}>
                                            <MaterialCommunityIcons
                                                name={(SPORT_ICONS[sport.name] || 'run') as any}
                                                size={32}
                                                color="#333"
                                            />
                                            <View style={styles.sportOptionInfo}>
                                                <Text style={styles.sportOptionName}>{sport.name}</Text>
                                                {!!sport.surface && (
                                                    <Text style={styles.sportOptionSurface}>{sport.surface}</Text>
                                                )}
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#999" />
                                    </TouchableOpacity>
                                ))}
                            </>
                        ) : (
                            <>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity
                                        style={styles.backArrow}
                                        onPress={() => { setSelectedSport(null); setDynamicPitches([]); }}
                                    >
                                        <Ionicons name="arrow-back" size={22} color="#333" />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>{selectedSport.name} — Select Pitch</Text>
                                    <TouchableOpacity onPress={closeModal}>
                                        <Ionicons name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                {/* Dynamic pitch list from backend */}
                                {pitchesLoading ? (
                                    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                                        <ActivityIndicator color="#FF5722" />
                                        <Text style={{ color: '#999', marginTop: 8, fontSize: 13 }}>Loading pitches...</Text>
                                    </View>
                                ) : dynamicPitches.length === 0 ? (
                                    <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                                        <MaterialCommunityIcons name="stadium-outline" size={40} color="#ddd" />
                                        <Text style={{ color: '#999', marginTop: 8, fontSize: 14 }}>No pitches available</Text>
                                        <Text style={{ color: '#bbb', fontSize: 12, marginTop: 4 }}>Admin hasn't added slots yet</Text>
                                    </View>
                                ) : (
                                    dynamicPitches.map((pitch, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={styles.sportOption}
                                            onPress={() => handlePickPitch(pitch)}
                                        >
                                            <View style={styles.sportOptionLeft}>
                                                <View style={styles.pitchNumberBadge}>
                                                    <Text style={styles.pitchNumberText}>{i + 1}</Text>
                                                </View>
                                                <View style={styles.sportOptionInfo}>
                                                    <Text style={styles.sportOptionName}>{pitch}</Text>
                                                    <Text style={styles.sportOptionSurface}>{selectedSport.surface || 'Turf'}</Text>
                                                </View>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color="#999" />
                                        </TouchableOpacity>
                                    ))
                                )}
                            </>
                        )}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
    loadingText: { fontSize: 14, color: '#999' },
    errorText: { fontSize: 15, color: '#666', textAlign: 'center' },
    retryBtn: { backgroundColor: '#FF5722', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
    retryBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
    headerActions: { flexDirection: 'row', gap: 8 },
    iconButton: { padding: 4 },
    scrollView: { flex: 1 },
    imageCarousel: { height: 200, position: 'relative' },
    carouselImage: { width, height: 200, resizeMode: 'cover' },
    imageDots: {
        position: 'absolute', bottom: 12, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'center', gap: 6,
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
    activeDot: { backgroundColor: COLORS.white, width: 20 },
    infoSection: { padding: SPACING.lg, borderBottomWidth: 8, borderBottomColor: '#f5f5f5' },
    venueName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    priceTimings: { fontSize: 14, color: '#666', marginBottom: SPACING.md },
    addressContainer: { flexDirection: 'row', gap: 6, marginBottom: 6 },
    addressText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 18 },
    ratingContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.sm,
    },
    ratingBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9',
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, gap: 4,
    },
    ratingText: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50' },
    reviewsText: { fontSize: 12, color: '#666' },
    rateButton: { borderWidth: 1, borderColor: '#FF5722', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
    rateButtonText: { fontSize: 12, color: '#FF5722', fontWeight: '600' },
    section: { padding: SPACING.lg, borderBottomWidth: 8, borderBottomColor: '#f5f5f5' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: SPACING.md },
    sportsChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    sportChip: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5',
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6,
    },
    sportChipText: { fontSize: 13, color: '#333' },
    aboutText: { fontSize: 14, color: '#666', lineHeight: 20 },
    rulesSection: { borderBottomWidth: 8, borderBottomColor: '#f5f5f5' },
    rulesCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#E3F2FD', padding: SPACING.lg,
        marginHorizontal: SPACING.lg, marginVertical: SPACING.md, borderRadius: 8,
    },
    rulesLeft: { flex: 1 },
    rulesTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    rulesTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    rulesSubtitle: { fontSize: 11, color: '#4CAF50', fontWeight: '600', marginLeft: 28 },
    rulesContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
    rulesHeading: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    ruleText: { fontSize: 14, color: '#555', lineHeight: 21, marginBottom: 10 },
    policyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
    policyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333', marginTop: 6 },
    policyText: { flex: 1, fontSize: 14, color: '#555', lineHeight: 21 },
    facilitiesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.sm },
    amenityText: { fontSize: 14, color: '#333' },
    seeAllLink: { fontSize: 13, color: '#03A9F4', fontWeight: '600', marginTop: SPACING.sm },
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.white, padding: SPACING.md,
        borderTopWidth: 1, borderTopColor: '#f0f0f0',
    },
    proceedButton: {
        backgroundColor: '#FF5722', flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: 8, gap: 8,
    },
    proceedButtonText: { fontSize: 14, fontWeight: 'bold', color: COLORS.white },
    modalOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: SPACING.lg, maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    sportOption: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    sportOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sportOptionInfo: { gap: 4 },
    sportOptionName: { fontSize: 16, fontWeight: '600', color: '#333' },
    sportOptionSurface: { fontSize: 13, color: '#666' },
    backArrow: { padding: 4, marginRight: 4 },
    pitchNumberBadge: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#FF5722', alignItems: 'center', justifyContent: 'center',
    },
    pitchNumberText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },

    // ── Map section ────────────────────────────────────────────
    mapSection: { padding: SPACING.lg, borderBottomWidth: 8, borderBottomColor: '#f5f5f5' },
    mapAddressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    mapAddressText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
    map: { width: '100%', height: 200, borderRadius: 12, overflow: 'hidden' },
    mapPlaceholder: {
        height: 160, borderRadius: 12, backgroundColor: '#f5f5f5',
        alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    mapPlaceholderText: { fontSize: 13, color: '#aaa' },
    openMapsBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginTop: 12, backgroundColor: '#4285F4',
        paddingVertical: 12, borderRadius: 10,
    },
    openMapsBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
