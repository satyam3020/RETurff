import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/theme';
import { getAuthUser } from '../../services/api';

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
                <TouchableOpacity style={styles.locationPill}>
                    <Ionicons name="location-sharp" size={13} color="#FF5722" />
                    <Text style={styles.locationText}>Nearby</Text>
                </TouchableOpacity>

                {/* Notification bell */}
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="notifications-outline" size={22} color="#444" />
                    {/* Red dot for unread */}
                    <View style={styles.badge} />
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
    badge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5722',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
});
