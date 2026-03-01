import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/theme';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - (SPACING.md * 2);

const BANNERS = [
    {
        id: '1',
        title: 'Premium Astro Turf in City!',
        subtitle: 'TOP RATED VENUE',
        sport: 'FOOTBALL & CRICKET',
        location: 'DOWNTOWN ARENA',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    },
    {
        id: '2',
        title: 'Elite Night Box Cricket',
        subtitle: 'PLAY UNDER THE LIGHTS',
        sport: 'CRICKET',
        location: 'SPORTS COMPLEX',
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
    }
];

export default function BannerCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= BANNERS.length) nextIndex = 0;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setCurrentIndex(nextIndex);
        }, 5000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    const renderItem = ({ item }: { item: typeof BANNERS[0] }) => (
        <View style={styles.bannerContainer}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.overlay}>
                <View style={styles.badge}>
                    <MaterialCommunityIcons name="crown" size={12} color="#FFD700" />
                    <Text style={styles.badgeText}>{item.subtitle}</Text>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.sportText}>{item.sport}</Text>
                <Text style={styles.locationText}>{item.location}</Text>

                <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>BOOK NOW</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={BANNERS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
            <View style={styles.pagination}>
                {BANNERS.map((_, i) => (
                    <View
                        key={i}
                        style={[styles.dot, currentIndex === i && styles.activeDot]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING.md,
    },
    listContent: {
        paddingHorizontal: SPACING.md,
    },
    bannerContainer: {
        width: BANNER_WIDTH,
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        marginRight: SPACING.md,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: SPACING.md,
        justifyContent: 'center',
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    badgeText: {
        color: '#FFD700',
        fontSize: 10,
        fontWeight: 'bold',
    },
    title: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    sportText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.9,
    },
    locationText: {
        color: '#FFD700',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
    },
    bookButton: {
        backgroundColor: '#FFB300',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 15,
        alignSelf: 'flex-start',
    },
    bookButtonText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ccc',
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: '#FF5722',
        width: 12,
    },
});
