// Profile Screen - Edit user profile
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { getUserProfile, saveUserProfile } from '../../services/storage';
import { updateUserProfile } from '../../services/api';
import { validateName, validatePhone } from '../../utils/validators';
import { SUCCESS_MESSAGES } from '../../utils/constants';
import { COLORS, SPACING } from '../../utils/theme';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ProfileScreen() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            const profile = await getUserProfile();
            if (profile) {
                setName(profile.name);
                setPhone(profile.phone);
            }
            setInitialLoading(false);
        };

        loadProfile();
    }, []);

    const handleSaveProfile = async () => {
        // Validate
        const validationErrors: Record<string, string> = {};

        const nameError = validateName(name);
        if (nameError) validationErrors.name = nameError.message;

        const phoneError = validatePhone(phone);
        if (phoneError) validationErrors.phone = phoneError.message;

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const user = { name, phone };

            // Call API (mock for now)
            const response = await updateUserProfile(user);

            if (response.success) {
                // Save to local storage
                await saveUserProfile(user);
                Alert.alert('Success', SUCCESS_MESSAGES.PROFILE_UPDATED);
            } else {
                Alert.alert('Error', response.error || 'Failed to update profile');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <LoadingSpinner message="Loading profile..." />;
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Card>
                    <Input
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        error={errors.name}
                        autoCapitalize="words"
                    />

                    <Input
                        label="Phone Number"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="10-digit mobile number"
                        keyboardType="phone-pad"
                        maxLength={10}
                        error={errors.phone}
                    />

                    <Button
                        title="Save Profile"
                        onPress={handleSaveProfile}
                        loading={loading}
                        disabled={loading}
                        style={styles.saveButton}
                    />
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    saveButton: {
        marginTop: SPACING.md,
    },
});
