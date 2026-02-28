import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getVenues } from '../../services/api';
import { COLORS, SPACING } from '../../utils/theme';
import type { Turf } from '../../types';

// New specialized components
import HomeHeader from '../../components/home/HomeHeader';
import BannerCarousel from '../../components/home/BannerCarousel';
import ProfileProgressCard from '../../components/home/ProfileProgressCard';
import VenueFilters from '../../components/home/VenueFilters';
import VenueListingCard from '../../components/home/VenueListingCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';

// ─── Static fallback venue shown when backend is unavailable ─────────────────
const STATIC_VENUES: Turf[] = [
    {
        id: 'returf-static-1',
        name: 'RETurf',
        description: 'Premium multi-sport turf arena with state-of-the-art facilities. Book your slot now!',
        location: 'Mumbai, Maharashtra',
        pricePerHour: 200,
        images: [
            'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',  // Football turf
            'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',  // Cricket turf
        ],
        amenities: ['Artificial Turf', 'Flood Lights', 'Parking', 'Changing Room', 'Drinking Water'],
        rating: 4.8,
        reviews: 124,
    },
];

export default function HomeScreen() {
    const [venues, setVenues] = useState<Turf[]>(STATIC_VENUES);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        if (!refreshing) setLoading(true);
        setError(null);

        try {
            const response = await getVenues();
            if (response.success && Array.isArray(response.data) && response.data.length > 0) {
                setVenues(response.data);
            } else {
                // Backend returned nothing — keep showing the static venue
                setVenues(STATIC_VENUES);
            }
        } catch {
            // Network error — keep showing the static venue
            setVenues(STATIC_VENUES);
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <HomeHeader />
                <LoadingSpinner message="Searching for venues..." />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Custom Branded Header */}
            <HomeHeader />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5722" />
                }
            >
                {/* 1. Promotional Banner Carousel */}
                <BannerCarousel />

                {/* 2. Profile Completion Card */}
                <ProfileProgressCard />

                {/* 3. Available Venues Section Header & Filters */}
                <VenueFilters />

                {/* 4. Venue Listing Cards */}
                <View style={styles.listContainer}>
                    {venues.map((venue) => (
                        <VenueListingCard key={venue.id} venue={venue} />
                    ))}
                </View>

                {/* Bottom padding for tabs */}
                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollView: {
        flex: 1,
    },
    listContainer: {
        paddingBottom: SPACING.xl,
    }
});
