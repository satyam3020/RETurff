// Favourite Venues — shows user's liked venues
import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { userApi } from '../services/api';

export default function FavouriteVenuesScreen() {
    const [venues, setVenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await userApi.getFavourites();
            if (res.success) setVenues(res.data || []);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

    const handleRemoveFavourite = async (venueId: string) => {
        // Optimistic update
        setVenues((prev) => prev.filter((v) => (v._id || v.id) !== venueId));
        await userApi.toggleFavourite(venueId);
    };

    const renderItem = ({ item }: { item: any }) => {
        const venueId = item._id || item.id;
        const image = item.images?.[0];

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/venue/${venueId}` as any)}
                activeOpacity={0.8}
            >
                {/* Image */}
                {image ? (
                    <Image source={{ uri: image }} style={styles.cardImage} />
                ) : (
                    <View style={[styles.cardImage, styles.placeholder]}>
                        <Text style={styles.placeholderText}>{item.name?.charAt(0) || 'V'}</Text>
                    </View>
                )}

                {/* Info */}
                <View style={styles.cardBody}>
                    <Text style={styles.venueName} numberOfLines={1}>{item.name}</Text>

                    {item.location && (
                        <View style={styles.locationRow}>
                            <Ionicons name="location-sharp" size={12} color="#FF5722" />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {typeof item.location === 'object' ? item.location.address : item.location}
                            </Text>
                        </View>
                    )}

                    {item.rating != null && (
                        <View style={styles.ratingRow}>
                            <MaterialCommunityIcons name="star" size={13} color="#FFA000" />
                            <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                    )}
                </View>

                {/* Remove favourite */}
                <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={() => handleRemoveFavourite(venueId)}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                    <Ionicons name="heart" size={22} color="#FF5252" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Favourite Venues</Text>
                <View style={{ width: 36 }} />
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#FF5722" />
            ) : (
                <FlatList
                    data={venues}
                    keyExtractor={(item) => item._id || item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#FF5722']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <View style={styles.emptyIconWrap}>
                                <Ionicons name="heart-outline" size={42} color="#ddd" />
                            </View>
                            <Text style={styles.emptyTitle}>No favourites yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Tap the heart icon on any venue to add it here.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
        paddingVertical: 14, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#222' },

    // List
    list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },

    // Card
    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    cardImage: {
        width: 72, height: 72, borderRadius: 12,
    },
    placeholder: {
        backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center',
    },
    placeholderText: { fontSize: 28, fontWeight: 'bold', color: 'rgba(255,87,34,0.8)' },
    cardBody: { flex: 1, marginLeft: 14, gap: 4 },
    venueName: { fontSize: 15, fontWeight: '700', color: '#111' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    locationText: { fontSize: 12, color: '#888', flex: 1 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    ratingText: { fontSize: 12, fontWeight: '600', color: '#555' },

    heartBtn: { padding: 6 },

    // Empty
    emptyWrap: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40, gap: 8 },
    emptyIconWrap: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: '#fce4ec',
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
    emptySubtitle: { fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 18 },
});
