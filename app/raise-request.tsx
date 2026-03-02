import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { userApi } from '../services/api';

// ─── Service categories ─────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
    {
        id: 'bookings',
        title: 'Bookings',
        description: 'I selected the wrong date, I selected the wrong time slot...',
        icon: 'calendar-text' as const,
    },
    {
        id: 'cancellations',
        title: 'Cancellations & Rescheduling',
        description: 'Cancel your Booking, Reschedule your Booking.',
        icon: 'calendar-sync' as const,
    },
    {
        id: 'payments',
        title: 'Payments & Refunds',
        description: 'Payments Related Issues, Split Payment Issues, Refund related issues, KM Credits Refund Issues.',
        icon: 'cash-refund' as const,
    },
    {
        id: 'other',
        title: 'Other queries',
        description: 'Generic queries',
        icon: 'message-text-outline' as const,
    },
];

export default function RaiseRequestScreen() {
    const [selectedCategory, setSelectedCategory] = useState<typeof SERVICE_CATEGORIES[number] | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleCategoryPress = (category: typeof SERVICE_CATEGORIES[number]) => {
        setSelectedCategory(category);
        setSubject('');
        setDescription('');
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!subject.trim()) {
            Alert.alert('Required', 'Please enter a subject.');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Required', 'Please describe your issue.');
            return;
        }
        if (!selectedCategory) return;

        setSubmitting(true);
        try {
            const res = await userApi.createSupportRequest({
                category: selectedCategory.id,
                subject: subject.trim(),
                description: description.trim(),
            });

            if (res.success) {
                setShowModal(false);
                Alert.alert(
                    'Request Submitted',
                    'Your support request has been submitted successfully. We will get back to you soon.',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert('Error', res.message || 'Failed to submit request. Please try again.');
            }
        } catch {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ── Header ─────────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Raise a Request</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Subtitle ───────────────────────────────────── */}
                <Text style={styles.subtitle}>Choose a service you need help with</Text>

                {/* ── Category cards ─────────────────────────────── */}
                {SERVICE_CATEGORIES.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={styles.card}
                        onPress={() => handleCategoryPress(category)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.cardTop}>
                            <View style={styles.iconContainer}>
                                <MaterialCommunityIcons
                                    name={category.icon}
                                    size={22}
                                    color="#333"
                                />
                            </View>
                            <Text style={styles.cardTitle}>{category.title}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#bbb" />
                        </View>
                        <Text style={styles.cardDescription}>{category.description}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* ── Submit Form Modal ──────────────────────────── */}
            <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
                <SafeAreaView style={styles.modalSafe}>
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowModal(false)} style={{ padding: 4 }}>
                                <Ionicons name="close" size={22} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {selectedCategory?.title || 'New Request'}
                            </Text>
                            <View style={{ width: 30 }} />
                        </View>

                        <ScrollView contentContainerStyle={styles.formContent}>
                            {/* Category badge */}
                            <View style={styles.categoryBadge}>
                                <MaterialCommunityIcons
                                    name={selectedCategory?.icon || 'help-circle'}
                                    size={18}
                                    color="#FF5722"
                                />
                                <Text style={styles.categoryBadgeText}>
                                    {selectedCategory?.title}
                                </Text>
                            </View>

                            {/* Subject */}
                            <View style={styles.field}>
                                <Text style={styles.label}>Subject *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={subject}
                                    onChangeText={setSubject}
                                    placeholder="Brief summary of your issue"
                                    placeholderTextColor="#bbb"
                                    maxLength={100}
                                />
                            </View>

                            {/* Description */}
                            <View style={styles.field}>
                                <Text style={styles.label}>Description *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Describe your issue in detail. Include booking ID, dates, or any relevant information..."
                                    placeholderTextColor="#bbb"
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Submit button */}
                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                                onPress={handleSubmit}
                                disabled={submitting}
                                activeOpacity={0.8}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="send" size={18} color="#fff" />
                                        <Text style={styles.submitBtnText}>Submit Request</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#fff',
    },

    // ── Header ──────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 17,
        fontWeight: '600',
        color: '#222',
    },
    headerSpacer: {
        width: 36,
    },

    // ── Scroll ──────────────────────────────────────────
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },

    // ── Subtitle ────────────────────────────────────────
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        marginBottom: 24,
    },

    // ── Cards ───────────────────────────────────────────
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 14,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#222',
    },
    cardDescription: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
        paddingLeft: 44,
    },

    // ── Modal ───────────────────────────────────────────
    modalSafe: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#111',
    },
    formContent: {
        padding: 20,
        gap: 20,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF3EF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    categoryBadgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FF5722',
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 13,
        color: '#555',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 14,
        color: '#111',
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    textArea: {
        height: 140,
        textAlignVertical: 'top',
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FF5722',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
