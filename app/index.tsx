import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    Image,
    TouchableOpacity,
    SafeAreaView,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

interface Slide {
    id: string;
    title: string;
    subtitle: string;
    image: string;
}

const SLIDES: Slide[] = [
    {
        id: '1',
        title: 'Book Sport Venues',
        subtitle: 'Get instant access to 1000+ Sport Venues at your fingertips',
        image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80',
    },
    {
        id: '2',
        title: 'Sports Coaching',
        subtitle: 'Learn 20+ activities and sports from certified coaches at the convenience of your society',
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
    },
    {
        id: '3',
        title: 'Cancellations & Refund',
        subtitle: 'Now Experience easy cancellations & refund. Got a referral Code? Click here',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    },
    {
        id: '4',
        title: 'Find Players',
        subtitle: 'Connect with other sports enthusiasts in your area and play together.',
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
    },
    {
        id: '5',
        title: 'Tournaments',
        subtitle: 'Participate in local tournaments and win exciting prizes.',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    },
    {
        id: '6',
        title: 'Track Performance',
        subtitle: 'Keep track of your bookings and game statistics all in one place.',
        image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    },
];

export default function OnboardingScreen() {
    const [showSplash, setShowSplash] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Splash Screen Logic
    useEffect(() => {
        const splashTimer = setTimeout(() => {
            setShowSplash(false);
        }, 2500); // Show splash for 2.5 seconds
        return () => clearTimeout(splashTimer);
    }, []);

    // Auto-slide logic
    useEffect(() => {
        if (!showSplash) {
            startAutoSlide();
        }
        return () => stopAutoSlide();
    }, [currentIndex, showSplash]);

    const startAutoSlide = () => {
        stopAutoSlide();
        timerRef.current = setTimeout(() => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= SLIDES.length) {
                nextIndex = 0;
            }
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setCurrentIndex(nextIndex);
        }, 3000); // Change slide every 3 seconds
    };

    const stopAutoSlide = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / width);
        if (index !== currentIndex) {
            setCurrentIndex(index);
        }
    };

    // Pause auto-slide whilst user is interacting
    const onScrollBeginDrag = () => {
        stopAutoSlide();
    }

    const onScrollEndDrag = () => {
        startAutoSlide();
    }

    const handleStart = () => {
        stopAutoSlide();
        // Navigate to Login instead of tabs
        router.replace('/login');
    };

    const renderItem = ({ item }: { item: Slide }) => {
        return (
            <View style={styles.slide}>
                {/* Image Container with Phone Mockup look */}
                <View style={styles.imageContainer}>
                    <View style={styles.phoneFrame}>
                        <Image
                            source={{ uri: item.image }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <View style={styles.imageOverlay} />
                    </View>
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.subtitle}>{item.subtitle}</Text>
                </View>
            </View>
        );
    };

    if (showSplash) {
        return (
            <View style={styles.splashContainer}>
                <StatusBar style="light" />
                {/* Fade in animation could go here */}
                <View style={styles.logoContainer}>
                    <Text style={styles.splashIcon}>🏟️</Text>
                    <Text style={styles.splashText}>RETurf</Text>
                    <Text style={styles.splashTagline}>INDIA'S SPORTS APP</Text>
                </View>
                {/* Bottom detail for professionalism */}
                <View style={styles.splashFooter}>
                    <Text style={styles.splashFooterText}>Powered by Expo</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.listContainer}>
                <FlatList
                    ref={flatListRef}
                    data={SLIDES}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    onScrollBeginDrag={onScrollBeginDrag}
                    onScrollEndDrag={onScrollEndDrag}
                    scrollEventThrottle={16}
                    bounces={false}
                />
            </View>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {SLIDES.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            currentIndex === index && styles.activeDot,
                        ]}
                    />
                ))}
            </View>

            {/* Footer / Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleStart} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>START</Text>
                    <Text style={styles.buttonIcon}>→</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    splashContainer: {
        flex: 1,
        backgroundColor: '#FF5722', // Orange base
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 50,
    },
    logoContainer: {
        alignItems: 'center',
    },
    splashIcon: {
        fontSize: 80,
        marginBottom: SPACING.lg,
        color: COLORS.white,
    },
    splashText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: COLORS.white,
        letterSpacing: 2,
    },
    splashTagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: 4,
        marginTop: SPACING.md,
        fontWeight: '600',
    },
    splashFooter: {
        position: 'absolute',
        bottom: 40,
    },
    splashFooterText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    listContainer: {
        flex: 1, // Take available space
    },
    slide: {
        width: width,
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
    },
    imageContainer: {
        // Increased height to prevent overlap
        height: height * 0.6,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    phoneFrame: {
        width: width * 0.7, // Responsive width
        aspectRatio: 1 / 2, // Keep phone aspect ratio
        maxHeight: height * 0.55, // Don't exceed container
        backgroundColor: COLORS.black,
        borderRadius: 30,
        borderWidth: 8,
        borderColor: '#333',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    textContainer: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.black,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: SPACING.md,
        maxWidth: '90%',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
        marginTop: SPACING.md,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.gray300,
        marginHorizontal: 4,
    },
    activeDot: {
        width: 24,
        backgroundColor: '#FF5722',
    },
    footer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    button: {
        backgroundColor: '#FF5722',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        elevation: 2,
        shadowColor: '#FF5722',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: SPACING.sm,
        letterSpacing: 1,
    },
    buttonIcon: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
});
