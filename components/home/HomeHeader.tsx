import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';
import { getAuthUser } from '../../services/api';

// Turf location coordinates
const TURF_LOCATION = {
    latitude: 19.299394,
    longitude: 72.875842,
    name: 'RETurf - Mira Road',
};

export default function HomeHeader() {
    const [greeting, setGreeting] = useState('Hey');
    const [firstName, setFirstName] = useState('');

    useEffect(() => {
        // Dynamic greeting based on time
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 17) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        // Load user name
        getAuthUser().then((user) => {
            if (user?.name) {
                setFirstName(user.name.split(' ')[0]); // first name only
            }
        });
    }, []);

    const openTurfLocation = () => {
        const { latitude, longitude, name } = TURF_LOCATION;
        const label = encodeURIComponent(name);
        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
            android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
        });
        if (url) Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            {/* Logo + Greeting */}
            <View style={styles.leftSection}>
                <View style={styles.logoCircle}>
                    <MaterialCommunityIcons name="stadium" size={20} color={COLORS.white} />
                </View>
                <View>
                    <Text style={styles.greetingText}>
                        {greeting}{firstName ? `, ${firstName}` : ''} 👋
                    </Text>
                    <Text style={styles.brandText}>RETurf</Text>
                </View>
            </View>

            {/* Actions on Right */}
            <View style={styles.rightSection}>
                {/* Location pill */}
                <TouchableOpacity style={styles.locationPill} onPress={openTurfLocation}>
                    <Ionicons name="location-sharp" size={13} color="#FF5722" />
                    <Text style={styles.locationText}>Nearby</Text>
                </TouchableOpacity>

                {/* History icon */}
                <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/booking-history')}>
                    <Ionicons name="time-outline" size={22} color="#444" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.white,
        height: 60,
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FF5722',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    brandText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF5722',
        letterSpacing: 0.5,
        lineHeight: 20,
    },
    greetingText: {
        fontSize: 11,
        color: '#888',
        fontWeight: '500',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    iconButton: {
        padding: 8,
        position: 'relative',
    },
    locationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3EF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 4,
        gap: 3,
        borderWidth: 1,
        borderColor: '#FFD5C8',
    },
    locationText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF5722',
    },
});
