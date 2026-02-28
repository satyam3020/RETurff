// Answer Prompts Screen — saves answers to backend
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';
import { userApi, saveAuthData, getAuthToken } from '../../services/api';

const PROMPTS = [
    'What sports do you love playing?',
    'Your favorite sports memory?',
    'What motivates you to play?',
    'Dream sports venue to play at?',
    'Your sports goal for this year?',
];

export default function AnswerPromptsScreen() {
    const [answers, setAnswers] = useState<string[]>(Array(5).fill(''));
    const [saving, setSaving] = useState(false);

    const handleAnswerChange = (index: number, text: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = text;
        setAnswers(newAnswers);
    };

    const answeredCount = answers.filter(a => a.trim().length > 0).length;
    const canProceed = answeredCount === 5;

    const handleSubmit = async () => {
        if (!canProceed) return;
        setSaving(true);
        try {
            const res = await userApi.updateProfile({ promptsAnswered: answeredCount });
            if (res.success) {
                const token = await getAuthToken();
                if (token && res.data) await saveAuthData(token, res.data);
                Alert.alert('Done!', 'All 5 prompts answered!', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            } else {
                Alert.alert('Error', res.message || 'Failed to save prompts.');
            }
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Answer 5 Prompts ({answeredCount}/5)</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.subtitle}>Prompts Help Generate Your Bio</Text>

                {PROMPTS.map((prompt, index) => (
                    <View key={index} style={styles.promptCard}>
                        <Text style={styles.promptNumber}>Prompt {index + 1}</Text>
                        <Text style={styles.promptText}>{prompt}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Type your answer here..."
                            placeholderTextColor="#999"
                            value={answers[index]}
                            onChangeText={(text) => handleAnswerChange(index, text)}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.submitButton, !canProceed && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!canProceed || saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {canProceed ? 'Submit Answers' : `Answer ${5 - answeredCount} more`}
                        </Text>
                    )}
                </TouchableOpacity>

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
    scrollView: {
        flex: 1,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginVertical: SPACING.lg,
    },
    promptCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        padding: SPACING.lg,
        borderRadius: 12,
    },
    promptNumber: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF5722',
        marginBottom: 4,
    },
    promptText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: SPACING.md,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: SPACING.md,
        fontSize: 14,
        color: '#333',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#E0E0E0',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
    },
});
