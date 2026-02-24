import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';

// Password reset via email OTP is not yet available.
// Backend requires email/SMS provider integration (SendGrid / Twilio).
// This screen shows a placeholder until that is set up.

const BACKEND_RESET_AVAILABLE = false;


type Step = 'email' | 'reset';

export default function ForgotPasswordScreen() {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [foundEmail, setFoundEmail] = useState(''); // email confirmed to exist

    // ── Step 1: Send reset code ───────────────────────────
    const handleSendCode = async () => {
        if (!BACKEND_RESET_AVAILABLE) {
            Alert.alert(
                '🚧 Coming Soon',
                'Password reset via email is not yet available.\n\nPlease contact support or create a new account.',
                [{ text: 'OK' }]
            );
            return;
        }
    };

    // ── Step 2: Verify code & set new password ────────────
    const handleReset = async () => {
        if (!BACKEND_RESET_AVAILABLE) return;
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar style="light" />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* ── Orange Header ─────────────────── */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.circleDecoration} />
                    <View style={styles.logoContainer}>
                        <Text style={styles.headerEmoji}>{step === 'email' ? '🔒' : '🔑'}</Text>
                        <Text style={styles.logoText}>RETurf</Text>
                        <Text style={styles.tagline}>
                            {step === 'email' ? 'FORGOT PASSWORD' : 'SET NEW PASSWORD'}
                        </Text>
                    </View>
                </View>

                {/* ── White Card ────────────────────── */}
                <View style={styles.content}>
                    <View style={styles.dragHandle} />
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        {step === 'email' ? (
                            /* ── Step 1: Email ─────────────── */
                            <>
                                <Text style={styles.title}>Forgot your password?</Text>
                                <Text style={styles.subtitle}>
                                    Enter the email linked to your account and we'll send a reset code.
                                </Text>

                                {/* Step indicator */}
                                <View style={styles.stepRow}>
                                    <View style={[styles.stepDot, styles.stepDotActive]} />
                                    <View style={styles.stepLine} />
                                    <View style={styles.stepDot} />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.inputRow}>
                                        <Ionicons name="mail-outline" size={18} color="#aaa" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="rahul@email.com"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholderTextColor={COLORS.gray400}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleSendCode}
                                    disabled={loading}
                                >
                                    <Ionicons name="send-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={styles.buttonText}>
                                        {loading ? 'CHECKING...' : 'SEND RESET CODE'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
                                    <Ionicons name="arrow-back-outline" size={14} color="#FF5722" />
                                    <Text style={styles.backLinkText}>Back to Login</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            /* ── Step 2: Enter code + new password ─────────── */
                            <>
                                <Text style={styles.title}>Enter Reset Code</Text>
                                <Text style={styles.subtitle}>
                                    Check your email <Text style={styles.boldText}>{foundEmail}</Text> for the 6-digit code.
                                </Text>

                                {/* Step indicator */}
                                <View style={styles.stepRow}>
                                    <View style={[styles.stepDot, styles.stepDotDone]}>
                                        <Ionicons name="checkmark" size={10} color="#fff" />
                                    </View>
                                    <View style={[styles.stepLine, styles.stepLineDone]} />
                                    <View style={[styles.stepDot, styles.stepDotActive]} />
                                </View>

                                {/* Reset Code */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Reset Code</Text>
                                    <View style={styles.inputRow}>
                                        <Ionicons name="keypad-outline" size={18} color="#aaa" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="6-digit code"
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            value={resetCode}
                                            onChangeText={setResetCode}
                                            placeholderTextColor={COLORS.gray400}
                                        />
                                    </View>
                                </View>

                                {/* New Password */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>New Password</Text>
                                    <View style={styles.inputRow}>
                                        <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { flex: 1 }]}
                                            placeholder="Min 6 characters"
                                            secureTextEntry={!showNew}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            autoCapitalize="none"
                                            placeholderTextColor={COLORS.gray400}
                                        />
                                        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew(p => !p)}>
                                            <Ionicons name={showNew ? 'eye-off' : 'eye'} size={20} color="#888" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Confirm New Password */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Confirm New Password</Text>
                                    <View style={styles.inputRow}>
                                        <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { flex: 1 }]}
                                            placeholder="Re-enter new password"
                                            secureTextEntry={!showConfirm}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            autoCapitalize="none"
                                            placeholderTextColor={COLORS.gray400}
                                        />
                                        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(p => !p)}>
                                            <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#888" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleReset}
                                    disabled={loading}
                                >
                                    <Ionicons name="shield-checkmark-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={styles.buttonText}>
                                        {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.backLink} onPress={() => setStep('email')}>
                                    <Ionicons name="arrow-back-outline" size={14} color="#FF5722" />
                                    <Text style={styles.backLinkText}>Change Email</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FF5722' },
    container: { flex: 1, backgroundColor: '#FF5722' },

    header: {
        flex: 0.4, justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
    },
    backBtn: {
        position: 'absolute', top: 16, left: 16, zIndex: 20,
        backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8,
    },
    circleDecoration: {
        position: 'absolute', width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(255,255,255,0.1)', top: -80, right: -80,
    },
    logoContainer: { alignItems: 'center', zIndex: 10 },
    headerEmoji: { fontSize: 36, marginBottom: SPACING.xs },
    logoText: { fontSize: 34, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
    tagline: { fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: 3, marginTop: 4, fontWeight: '600' },

    content: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: SPACING.xl, paddingBottom: SPACING.xxl,
        flex: 1,
    },
    dragHandle: {
        width: 40, height: 4, backgroundColor: COLORS.gray200,
        borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg,
    },
    title: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.xs },
    subtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md, lineHeight: 19 },
    boldText: { fontWeight: 'bold', color: COLORS.textPrimary },

    // Step indicator
    stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
    stepDot: {
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: COLORS.gray300,
        alignItems: 'center', justifyContent: 'center',
    },
    stepDotActive: { backgroundColor: '#FF5722' },
    stepDotDone: { backgroundColor: '#4CAF50' },
    stepLine: { flex: 1, height: 2, backgroundColor: COLORS.gray300, marginHorizontal: 6 },
    stepLineDone: { backgroundColor: '#4CAF50' },

    inputGroup: { marginBottom: SPACING.md },
    label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.xs, fontWeight: '600' },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: COLORS.gray300,
        borderRadius: BORDER_RADIUS.md, overflow: 'hidden',
        backgroundColor: '#fafafa',
    },
    inputIcon: { marginLeft: 12 },
    input: { flex: 1, padding: SPACING.md, fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
    eyeBtn: {
        paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center',
        alignSelf: 'stretch', backgroundColor: '#f0f0f0',
        borderLeftWidth: 1, borderLeftColor: COLORS.gray300,
    },

    button: {
        backgroundColor: '#FF5722', paddingVertical: 15, borderRadius: BORDER_RADIUS.md,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: SPACING.sm, marginBottom: SPACING.lg,
        shadowColor: '#FF5722', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
    },
    buttonDisabled: { opacity: 0.65 },
    buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },

    backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
    backLinkText: { color: '#FF5722', fontWeight: '600', fontSize: 13 },
});
