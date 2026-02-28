// Sports Preferences Screen — saves interestedSports to backend
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';
import { userApi, saveAuthData, getAuthToken, getAuthUser } from '../../services/api';

const SPORTS = [
    { name: 'Cricket', icon: 'cricket' },
    { name: 'Football', icon: 'soccer' },
    { name: 'Badminton', icon: 'badminton' },
    { name: 'Tennis', icon: 'tennis' },
    { name: 'Basketball', icon: 'basketball' },
    { name: 'Volleyball', icon: 'volleyball' },
    { name: 'Table Tennis', icon: 'table-tennis' },
    { name: 'Swimming', icon: 'swim' },
    { name: 'Hockey', icon: 'hockey-sticks' },
    { name: 'Running', icon: 'run' },
];

export default function SportsPreferencesScreen() {
    const [selected, setSelected] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getAuthUser().then((user) => {
            if (user?.preferences?.interestedSports?.length) {
                setSelected(user.preferences.interestedSports);
            }
        });
    }, []);

    const toggleSport = (sport: string) => {
        setSelected((prev) =>
            prev.includes(sport)
                ? prev.filter((s) => s !== sport)
                : [...prev, sport]
        );
    };

    const canSave = selected.length > 0;

    const handleSave = async () => {
        if (!canSave) return;
        setSaving(true);
        try {
            const cached = await getAuthUser();
            const existingPrefs = cached?.preferences || {};
            const res = await userApi.updateProfile({
                preferences: {
                    ...existingPrefs,
                    interestedSports: selected,
                },
            });
            if (res.success) {
                const token = await getAuthToken();
                if (token && res.data) await saveAuthData(token, res.data);
                Alert.alert('Saved!', `${selected.length} sport${selected.length > 1 ? 's' : ''} selected.`, [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            } else {
                Alert.alert('Error', res.message || 'Failed to save.');
            }
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sports Preferences</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.subtitle}>
                    Select the sports you love ({selected.length} selected)
                </Text>

                <View style={styles.grid}>
                    {SPORTS.map((sport) => {
                        const isActive = selected.includes(sport.name);
                        return (
                            <TouchableOpacity
                                key={sport.name}
                                style={[styles.sportCard, isActive && styles.sportCardActive]}
                                onPress={() => toggleSport(sport.name)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconCircle, isActive && styles.iconCircleActive]}>
                                    <MaterialCommunityIcons
                                        name={sport.icon as any}
                                        size={28}
                                        color={isActive ? '#fff' : '#666'}
                                    />
                                </View>
                                <Text style={[styles.sportName, isActive && styles.sportNameActive]}>
                                    {sport.name}
                                </Text>
                                {isActive && (
                                    <View style={styles.checkBadge}>
                                        <Ionicons name="checkmark" size={12} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, (!canSave || saving) && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={!canSave || saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            Save Preferences ({selected.length})
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
        backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    content: { flex: 1, paddingHorizontal: SPACING.lg },
    subtitle: {
        fontSize: 14, color: '#666', textAlign: 'center', marginVertical: SPACING.lg,
    },
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 12,
        justifyContent: 'space-between',
    },
    sportCard: {
        width: '47%',
        backgroundColor: COLORS.white,
        borderRadius: 14,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        position: 'relative',
        marginBottom: 4,
    },
    sportCardActive: {
        borderColor: '#FF5722',
        backgroundColor: '#FFF3E0',
    },
    iconCircle: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#F5F5F5',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
    },
    iconCircleActive: {
        backgroundColor: '#FF5722',
    },
    sportName: { fontSize: 13, fontWeight: '600', color: '#666' },
    sportNameActive: { color: '#FF5722', fontWeight: 'bold' },
    checkBadge: {
        position: 'absolute', top: 8, right: 8,
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: '#4CAF50',
        alignItems: 'center', justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 10,
        alignItems: 'center', marginTop: 24,
    },
    saveButtonDisabled: { opacity: 0.5 },
    saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
