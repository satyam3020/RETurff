// Basic Details Screen — saves age & gender to backend
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';
import { userApi, saveAuthData, getAuthToken, getAuthUser } from '../../services/api';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export default function BasicDetailsScreen() {
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getAuthUser().then((user) => {
            if (user?.preferences?.age) setAge(String(user.preferences.age));
            if (user?.preferences?.gender) setGender(user.preferences.gender);
        });
    }, []);

    const canSave = age.trim().length > 0 && gender.length > 0 && Number(age) > 0;

    const handleSave = async () => {
        if (!canSave) return;
        setSaving(true);
        try {
            // We need to merge with existing preferences
            const cached = await getAuthUser();
            const existingPrefs = cached?.preferences || {};
            const res = await userApi.updateProfile({
                preferences: {
                    ...existingPrefs,
                    age: Number(age),
                    gender,
                },
            });
            if (res.success) {
                const token = await getAuthToken();
                if (token && res.data) await saveAuthData(token, res.data);
                Alert.alert('Saved!', 'Basic details updated.', [
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
                <Text style={styles.headerTitle}>Basic Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.subtitle}>Tell us a little about yourself</Text>

                {/* Age */}
                <Text style={styles.label}>Your Age</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 25"
                    placeholderTextColor="#999"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    maxLength={3}
                />

                {/* Gender */}
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderRow}>
                    {GENDER_OPTIONS.map((g) => (
                        <TouchableOpacity
                            key={g}
                            style={[styles.genderChip, gender === g && styles.genderChipActive]}
                            onPress={() => setGender(g)}
                        >
                            <MaterialCommunityIcons
                                name={
                                    g === 'Male' ? 'gender-male' :
                                        g === 'Female' ? 'gender-female' : 'gender-non-binary'
                                }
                                size={20}
                                color={gender === g ? '#fff' : '#666'}
                            />
                            <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                                {g}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Save */}
                <TouchableOpacity
                    style={[styles.saveButton, (!canSave || saving) && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={!canSave || saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Details</Text>
                    )}
                </TouchableOpacity>
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
    subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginVertical: SPACING.lg },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 20 },
    input: {
        backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E0E0E0',
        borderRadius: 10, padding: SPACING.md, fontSize: 16, color: '#333',
    },
    genderRow: { flexDirection: 'row', gap: 12 },
    genderChip: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 14, borderRadius: 10,
        backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: '#E0E0E0',
    },
    genderChipActive: { backgroundColor: '#FF5722', borderColor: '#FF5722' },
    genderText: { fontSize: 14, fontWeight: '600', color: '#666' },
    genderTextActive: { color: '#fff' },
    saveButton: {
        backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 10,
        alignItems: 'center', marginTop: 32,
    },
    saveButtonDisabled: { opacity: 0.5 },
    saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
