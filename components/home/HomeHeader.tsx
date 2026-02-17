import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../utils/theme';

export default function HomeHeader() {
    return (
        <View style={styles.container}>
            {/* Logo on Left */}
            <View style={styles.leftSection}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoIcon}>🏟️</Text>
                </View>
            </View>

            {/* Location Picker in Center */}
            <TouchableOpacity style={styles.centerSection}>
                <Text style={styles.locationText} numberOfLines={1}>12, SN Dube R...</Text>
                <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            {/* Actions on Right */}
            <View style={styles.rightSection}>
                <TouchableOpacity style={styles.iconButton}>
                    <Text style={styles.actionIcon}>🔍</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.coinsButton}>
                    <Text style={styles.coinIcon}>🪙</Text>
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
    },
    logoCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FF5722',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoIcon: {
        fontSize: 20,
    },
    centerSection: {
        flex: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginRight: 4,
    },
    dropdownIcon: {
        fontSize: 10,
        color: '#666',
    },
    rightSection: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    iconButton: {
        padding: 8,
    },
    actionIcon: {
        fontSize: 20,
    },
    coinsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
        marginLeft: 5,
    },
    coinIcon: {
        fontSize: 16,
        marginRight: 4,
    },
    coinCount: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
});
