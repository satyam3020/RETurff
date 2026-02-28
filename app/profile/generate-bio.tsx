// Generate Bio Screen — saves bio to backend
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';
import { userApi, saveAuthData, getAuthToken, getAuthUser } from '../../services/api';

export default function GenerateBioScreen() {
    const [generatedBio, setGeneratedBio] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [customBio, setCustomBio] = useState('');
    const [saving, setSaving] = useState(false);

    // Load existing bio on mount
    useEffect(() => {
        getAuthUser().then((user) => {
            if (user?.bio) setCustomBio(user.bio);
        });
    }, []);

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            setGeneratedBio(
                "Passionate sports enthusiast who loves playing football and cricket. Always up for a game and meeting new players. Believer in teamwork and sportsmanship. Let's play!"
            );
            setIsGenerating(false);
        }, 2000);
    };

    const handleSave = async () => {
        const bioToSave = customBio || generatedBio;
        if (!bioToSave) return;
        setSaving(true);
        try {
            const res = await userApi.updateProfile({ bio: bioToSave });
            if (res.success) {
                const token = await getAuthToken();
                if (token && res.data) await saveAuthData(token, res.data);
                Alert.alert('Saved!', 'Your bio has been saved.', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            } else {
                Alert.alert('Error', res.message || 'Failed to save bio.');
            }
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    const handleUseGenerated = () => {
        setCustomBio(generatedBio);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create your Bio</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.subtitle}>Generate a bio with AI or write your own</Text>

                {/* Generate Button */}
                {!generatedBio && (
                    <TouchableOpacity
                        style={styles.generateButton}
                        onPress={handleGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="auto-fix" size={20} color={COLORS.white} />
                                <Text style={styles.generateButtonText}>Generate Bio with AI</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* Generated Bio */}
                {generatedBio && (
                    <View style={styles.bioCard}>
                        <View style={styles.bioHeader}>
                            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                            <Text style={styles.bioHeaderText}>Generated Bio</Text>
                        </View>
                        <Text style={styles.bioText}>{generatedBio}</Text>
                        <View style={styles.bioActions}>
                            <TouchableOpacity
                                style={styles.useButton}
                                onPress={handleUseGenerated}
                            >
                                <Ionicons name="checkmark" size={16} color="#fff" />
                                <Text style={styles.useButtonText}>Use This</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.regenerateButton}
                                onPress={handleGenerate}
                            >
                                <MaterialCommunityIcons name="refresh" size={16} color="#FF5722" />
                                <Text style={styles.regenerateButtonText}>Regenerate</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Custom Bio Option */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                </View>

                <Text style={styles.customLabel}>Write your own bio</Text>
                <TextInput
                    style={styles.customInput}
                    placeholder="Write something about yourself..."
                    placeholderTextColor="#999"
                    value={customBio}
                    onChangeText={setCustomBio}
                    multiline
                    numberOfLines={5}
                />

                {/* Save Button */}
                {(generatedBio || customBio) && (
                    <TouchableOpacity
                        style={[styles.saveButton, saving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Bio</Text>
                        )}
                    </TouchableOpacity>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginVertical: SPACING.lg,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FF5722',
        paddingVertical: 14,
        borderRadius: 8,
        marginBottom: SPACING.lg,
    },
    generateButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    bioCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: 12,
        marginBottom: SPACING.lg,
    },
    bioHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: SPACING.md,
    },
    bioHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4CAF50',
    },
    bioText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        marginBottom: SPACING.md,
    },
    bioActions: {
        flexDirection: 'row',
        gap: 12,
    },
    useButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    useButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
    regenerateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    regenerateButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF5722',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        fontSize: 12,
        color: '#999',
        marginHorizontal: SPACING.md,
    },
    customLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: SPACING.sm,
    },
    customInput: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: SPACING.md,
        fontSize: 14,
        color: '#333',
        minHeight: 120,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: SPACING.lg,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
    },
});
