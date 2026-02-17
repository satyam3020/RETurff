import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/theme';

export default function HomeHeader() {
    return (
        <View style={styles.container}>
            {/* Logo on Left */}
            <View style={styles.leftSection}>
                <View style={styles.logoCircle}>
                    <MaterialCommunityIcons name="stadium" size={20} color={COLORS.white} />
                </View>
                <Text style={styles.brandText}>RETurf</Text>
            </View>

            {/* Actions on Right */}
            <View style={styles.rightSection}>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="search" size={22} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.coinsButton}>
                    <MaterialCommunityIcons name="cash" size={18} color="#FF9800" />
                    <Text style={styles.coinCount}>0</Text>
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF5722',
        letterSpacing: 0.5,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    iconButton: {
        padding: 8,
    },
    coinsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
        marginLeft: 5,
        gap: 4,
    },
    coinCount: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
});
