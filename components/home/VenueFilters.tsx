import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/theme';

const CATEGORIES = [
    { id: '1', name: 'All Sports' },
    { id: '2', name: 'Box Cricket' },
    { id: '3', name: 'Football' },
    { id: '4', name: 'Padel' },
    { id: '5', name: 'Pickleball' },
];

export default function VenueFilters() {
    const [selectedSport, setSelectedSport] = React.useState('All Sports');

    return (
        <View style={styles.container}>
            <View style={styles.listingHeader}>
                <Text style={styles.mainTitle}>Available Venues <Text style={styles.countText}>(283)</Text></Text>
                <TouchableOpacity style={styles.filterToggle}>
                    <MaterialCommunityIcons name="tune-variant" size={18} color="#666" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterBar}>
                {/* Date Picker Pill */}
                <TouchableOpacity style={styles.datePill}>
                    <Text style={styles.dateText}>17th Feb</Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>

                {/* Sports Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportsScroll}>
                    {CATEGORIES.map((sport) => (
                        <TouchableOpacity
                            key={sport.id}
                            style={[styles.sportPill, selectedSport === sport.name && styles.sportPillActive]}
                            onPress={() => setSelectedSport(sport.name)}
                        >
                            <Text style={[styles.sportLabel, selectedSport === sport.name && styles.sportLabelActive]}>
                                {sport.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
    },
    listingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    mainTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    countText: {
        color: '#888',
        fontSize: 14,
        fontWeight: 'normal',
    },
    filterToggle: {
        width: 36,
        height: 36,
        backgroundColor: '#F5F5F5',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterIcon: {
        fontSize: 16,
    },
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    datePill: {
        backgroundColor: '#2E3D59', // Dark blue as per screenshot
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    dateText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 6,
    },
    dropdownIcon: {
        color: COLORS.white,
        fontSize: 10,
    },
    sportsScroll: {
        flex: 1,
    },
    sportPill: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    sportPillActive: {
        backgroundColor: '#FF5722',
        borderColor: '#FF5722',
    },
    sportLabel: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
    sportLabelActive: {
        color: COLORS.white,
    },
});
