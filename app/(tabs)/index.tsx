import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, SafeAreaView } from 'react-native';
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

export default function HomeScreen() {
    const [venues, setVenues] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        if (!refreshing) setLoading(true);
        setError(null);

        const response = await getVenues();

        if (response.success && response.data) {
            setVenues(response.data);
        } else {
            setError(response.error || 'Failed to load venues');
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
            <SafeAreaView style={styles.container}>
                <HomeHeader />
                <LoadingSpinner message="Searching for venues..." />
            </SafeAreaView>
        );
    }

    if (error && !refreshing) {
        return (
            <SafeAreaView style={styles.container}>
                <HomeHeader />
                <ErrorMessage message={error} onRetry={loadData} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
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
