import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, Alert, ScrollView, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../utils/theme';
import { saveAuthData, authApi } from '../services/api';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    // ── Keyboard visibility tracker ────────────────
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => { show.remove(); hide.remove(); };
    }, []);

    const validate = () => {
        if (name.trim().length < 2) {
            Alert.alert('Invalid Name', 'Please enter your full name.'); return false;
        }
        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            Alert.alert('Invalid Phone', 'Enter a valid 10-digit mobile number.'); return false;
        }
        if (!email.includes('@') || !email.includes('.')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.'); return false;
        }
        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return false;
        }
        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match.'); return false;
        }
        return true;
    };

    const handleSignup = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await authApi.register({ name: name.trim(), phone, email, password });
            if (!res.success || !res.token || !res.user) {
                Alert.alert('Registration Failed', res.message || 'Could not create account.');
                return;
            }
            await saveAuthData(res.token, res.user, res.refreshToken);
            router.replace('/(tabs)');
        } catch (e: any) {
            Alert.alert('Error', 'Something went wrong. Please check your network and try again.');
        } finally {
            setLoading(false);
        }
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
                        <Text style={styles.logoIcon}>🏟️</Text>
                        <Text style={styles.logoText}>RETurf</Text>
                        <Text style={styles.tagline}>CREATE YOUR ACCOUNT</Text>
                    </View>
                </View>

                {/* ── White Card ────────────────────── */}
                <View style={styles.content}>
                    <View style={styles.dragHandle} />
                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        <Text style={styles.title}>Join RETurf 🎉</Text>
                        <Text style={styles.subtitle}>Create your account to book turfs instantly</Text>

                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="person-outline" size={18} color="#aaa" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Rahul Sharma"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    placeholderTextColor={COLORS.gray400}
                                />
                            </View>
                        </View>

                        {/* Phone */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mobile Number</Text>
                            <View style={styles.inputRow}>
                                <View style={styles.countryCode}>
                                    <Text style={styles.ccText}>🇮🇳 +91</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="9000000000"
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholderTextColor={COLORS.gray400}
                                />
                            </View>
                        </View>

                        {/* Email */}
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
                            <Text style={styles.helperText}>Used for password recovery</Text>
                        </View>

                        {/* Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Min 6 characters"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    autoCapitalize="none"
                                    placeholderTextColor={COLORS.gray400}
                                />
                                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(p => !p)}>
                                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Re-enter password"
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

                        {/* Submit */}
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.buttonText}>{loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</Text>
                        </TouchableOpacity>

                        <Text style={styles.termsText}>
                            By creating an account, you agree to RETurf's{' '}
                            <Text style={styles.linkText}>Terms & Conditions</Text>
                        </Text>

                        {/* Already have account */}
                        <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
                            <Text style={styles.loginLinkText}>
                                Already have an account?{' '}
                                <Text style={styles.linkText}>Sign In</Text>
                            </Text>
                        </TouchableOpacity>
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
        flex: 0.38,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    backBtn: {
        position: 'absolute', top: 16, left: 16, zIndex: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20, padding: 8,
    },
    circleDecoration: {
        position: 'absolute', width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(255,255,255,0.1)', top: -80, right: -80,
    },
    logoContainer: { alignItems: 'center', zIndex: 10 },
    logoIcon: { fontSize: 36, marginBottom: SPACING.xs },
    logoText: { fontSize: 34, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
    tagline: { fontSize: 11, color: 'rgba(255,255,255,0.85)', letterSpacing: 3, marginTop: 4, fontWeight: '600' },

    content: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: SPACING.xl,
        paddingBottom: SPACING.xxl,
        flex: 1,
    },
    dragHandle: {
        width: 40, height: 4, backgroundColor: COLORS.gray200,
        borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg,
    },
    title: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.xs },
    subtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.lg, lineHeight: 18 },

    inputGroup: { marginBottom: SPACING.md },
    label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.xs, fontWeight: '600' },

    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: COLORS.gray300,
        borderRadius: BORDER_RADIUS.md, overflow: 'hidden',
        backgroundColor: '#fafafa',
    },
    inputIcon: { marginLeft: 12 },
    countryCode: {
        paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#f0f0f0', borderRightWidth: 1, borderRightColor: COLORS.gray300,
        alignSelf: 'stretch', paddingVertical: 14,
    },
    ccText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
    input: {
        flex: 1, padding: SPACING.md,
        fontSize: 15, fontWeight: '500', color: COLORS.textPrimary,
    },
    eyeBtn: {
        paddingHorizontal: 14,
        justifyContent: 'center', alignItems: 'center',
        alignSelf: 'stretch',
        backgroundColor: '#f0f0f0',
        borderLeftWidth: 1, borderLeftColor: COLORS.gray300,
    },
    helperText: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },

    button: {
        backgroundColor: '#FF5722', paddingVertical: 15, borderRadius: BORDER_RADIUS.md,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: SPACING.sm, marginBottom: SPACING.lg,
        shadowColor: '#FF5722', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
    },
    buttonDisabled: { opacity: 0.65 },
    buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },

    termsText: { textAlign: 'center', fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
    linkText: { color: '#FF5722', fontWeight: 'bold' },

    loginLink: { marginTop: SPACING.lg, alignItems: 'center', paddingBottom: SPACING.lg },
    loginLinkText: { fontSize: 13, color: COLORS.textSecondary },
});
