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
import { saveAuthData } from '../services/api';
import { mockAdminLogin } from '../services/adminMockApi';
import { loginUser } from '../services/authStore';

type Role = 'user' | 'admin';

export default function LoginScreen() {
    const [role, setRole] = useState<Role>('user');

    // ── User state ──────────────────────────────────────
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // ── Admin state ─────────────────────────────────────
    const [adminPhone, setAdminPhone] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showAdminPassword, setShowAdminPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    // ── User Login ───────────────────────────────────────
    const handleUserLogin = async () => {
        if (phone.length !== 10) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.'); return;
        }
        if (password.length < 6) {
            Alert.alert('Invalid Password', 'Password must be at least 6 characters.'); return;
        }
        setLoading(true);
        try {
            const res = await loginUser(phone, password);
            if (!res.success || !res.user) {
                Alert.alert('Login Failed', res.message || 'Incorrect phone or password.');
                return;
            }
            await saveAuthData(`mock_token_${res.user._id}`, {
                _id: res.user._id,
                name: res.user.name,
                phone: res.user.phone,
                email: res.user.email,
            });
            router.replace('/(tabs)');
        } catch (e: any) {
            Alert.alert('Error', 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Admin Login ──────────────────────────────────────
    const handleAdminLogin = async () => {
        if (adminPhone.length !== 10) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.'); return;
        }
        if (adminPassword.length < 6) {
            Alert.alert('Invalid Password', 'Password must be at least 6 characters.'); return;
        }
        setLoading(true);
        try {
            const res = await mockAdminLogin(adminPhone, adminPassword);
            if (!res.success) {
                Alert.alert('Login Failed', res.message || 'Invalid credentials.'); return;
            }
            await saveAuthData(res.token!, res.user);
            router.replace('/(admin)/dashboard');
        } catch (e: any) {
            Alert.alert('Error', 'Login failed. Please try again.');
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
                {/* ── Orange Header ─────────────────────── */}
                <View style={styles.header}>
                    <View style={styles.circleDecoration} />
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoIcon}>🏟️</Text>
                        <Text style={styles.logoText}>RETurf</Text>
                        <Text style={styles.tagline}>INDIA'S SPORTS APP</Text>
                    </View>
                </View>

                {/* ── White Card ────────────────────────── */}
                <View style={styles.content}>
                    <View style={styles.dragHandle} />

                    {/* ── Role Tabs ─────────────────────── */}
                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            style={[styles.roleTab, role === 'user' && styles.roleTabActive]}
                            onPress={() => setRole('user')} activeOpacity={0.8}
                        >
                            <Ionicons name="person" size={16} color={role === 'user' ? '#fff' : '#888'} />
                            <Text style={[styles.roleTabText, role === 'user' && styles.roleTabTextActive]}>User</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleTab, role === 'admin' && styles.roleTabActiveAdmin]}
                            onPress={() => setRole('admin')} activeOpacity={0.8}
                        >
                            <Ionicons name="shield-checkmark" size={16} color={role === 'admin' ? '#fff' : '#888'} />
                            <Text style={[styles.roleTabText, role === 'admin' && styles.roleTabTextActive]}>Admin</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        {role === 'user' ? (
                            /* ── USER FORM — Phone + Password ─────────── */
                            <>
                                <Text style={styles.title}>Welcome back! 👋</Text>
                                <Text style={styles.subtitle}>Sign in with your phone number and password</Text>

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

                                {/* Password */}
                                <View style={styles.inputGroup}>
                                    <View style={styles.labelRow}>
                                        <Text style={styles.label}>Password</Text>
                                        <TouchableOpacity onPress={() => router.push('/forgot-password' as any)}>
                                            <Text style={styles.forgotText}>Forgot Password?</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.passwordRow}>
                                        <TextInput
                                            style={[styles.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                                            placeholder="••••••••"
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={setPassword}
                                            placeholderTextColor={COLORS.gray400}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeBtn}
                                            onPress={() => setShowPassword(p => !p)}
                                        >
                                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Login Button */}
                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleUserLogin}
                                    disabled={loading}
                                >
                                    <Ionicons name="log-in-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={styles.buttonText}>{loading ? 'SIGNING IN...' : 'SIGN IN'}</Text>
                                </TouchableOpacity>

                                {/* Divider */}
                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                {/* Sign Up Link */}
                                <TouchableOpacity
                                    style={styles.signupButton}
                                    onPress={() => router.push('/signup' as any)}
                                >
                                    <Ionicons name="person-add-outline" size={18} color="#FF5722" style={{ marginRight: 6 }} />
                                    <Text style={styles.signupButtonText}>CREATE NEW ACCOUNT</Text>
                                </TouchableOpacity>

                                <Text style={styles.termsText}>
                                    By signing in, you agree to RETurf's{' '}
                                    <Text style={styles.linkText}>Terms & Conditions</Text>
                                </Text>
                            </>
                        ) : (
                            /* ── ADMIN FORM — Password-based ───────── */
                            <>
                                <Text style={styles.title}>Admin Login</Text>
                                <Text style={styles.subtitle}>Sign in with your admin credentials</Text>

                                <View style={styles.adminBanner}>
                                    <Ionicons name="shield-checkmark" size={18} color="#1a1a2e" />
                                    <Text style={styles.adminBannerText}>Secure Admin Access</Text>
                                </View>

                                <View style={styles.hintBox}>
                                    <Ionicons name="key-outline" size={14} color="#f59e0b" />
                                    <Text style={styles.hintText}>
                                        Demo credentials:{' '}
                                        <Text style={styles.hintBold}>9999999999</Text>
                                        {' / '}
                                        <Text style={styles.hintBold}>admin123</Text>
                                    </Text>
                                </View>

                                {/* Admin Phone */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Phone Number</Text>
                                    <View style={styles.inputRow}>
                                        <View style={styles.countryCode}>
                                            <Text style={styles.ccText}>🇮🇳 +91</Text>
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="9999999999"
                                            keyboardType="number-pad"
                                            maxLength={10}
                                            value={adminPhone}
                                            onChangeText={setAdminPhone}
                                            placeholderTextColor={COLORS.gray400}
                                        />
                                    </View>
                                </View>

                                {/* Admin Password */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.passwordRow}>
                                        <TextInput
                                            style={[styles.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                                            placeholder="••••••••"
                                            secureTextEntry={!showAdminPassword}
                                            value={adminPassword}
                                            onChangeText={setAdminPassword}
                                            placeholderTextColor={COLORS.gray400}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeBtn}
                                            onPress={() => setShowAdminPassword(p => !p)}
                                        >
                                            <Ionicons name={showAdminPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, styles.adminButton, loading && styles.buttonDisabled]}
                                    onPress={handleAdminLogin}
                                    disabled={loading}
                                >
                                    <Ionicons name="log-in-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={styles.buttonText}>{loading ? 'SIGNING IN...' : 'SIGN IN AS ADMIN'}</Text>
                                </TouchableOpacity>

                                <Text style={styles.termsText}>
                                    Admin access is restricted to authorised personnel only.
                                </Text>
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
        flex: 0.9, justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
    },
    circleDecoration: {
        position: 'absolute', width: 400, height: 400, borderRadius: 200,
        backgroundColor: 'rgba(255,255,255,0.1)', top: -100, right: -100,
    },
    logoContainer: { alignItems: 'center', zIndex: 10 },
    logoIcon: { fontSize: 48, marginBottom: SPACING.sm, color: COLORS.white },
    logoText: { fontSize: 40, fontWeight: 'bold', color: COLORS.white, letterSpacing: 1 },
    tagline: { fontSize: 14, color: 'rgba(255,255,255,0.9)', letterSpacing: 4, marginTop: SPACING.xs, fontWeight: '600' },

    content: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: SPACING.xl, paddingBottom: SPACING.xxl * 2,
        flex: 1.6,
    },
    dragHandle: {
        width: 40, height: 4, backgroundColor: COLORS.gray200,
        borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.lg,
    },

    roleContainer: {
        flexDirection: 'row', backgroundColor: '#f0f0f0',
        borderRadius: 12, padding: 4, marginBottom: SPACING.xl,
    },
    roleTab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 10, borderRadius: 10, gap: 6,
    },
    roleTabActive: { backgroundColor: '#FF5722', shadowColor: '#FF5722', shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
    roleTabActiveAdmin: { backgroundColor: '#1a1a2e', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
    roleTabText: { fontSize: 14, fontWeight: '600', color: '#888' },
    roleTabTextActive: { color: '#fff' },

    title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: SPACING.xs },
    subtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.lg, lineHeight: 18 },

    adminBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#f59e0b25', borderRadius: 10, padding: 12, marginBottom: SPACING.lg,
    },
    adminBannerText: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },

    inputGroup: { marginBottom: SPACING.md },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
    label: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
    forgotText: { fontSize: 13, color: '#FF5722', fontWeight: '600' },

    inputRow: { flexDirection: 'row', borderWidth: 1, borderColor: COLORS.gray300, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
    countryCode: {
        paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#f9f9f9', borderRightWidth: 1, borderRightColor: COLORS.gray300,
    },
    ccText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
    input: { flex: 1, padding: SPACING.md, fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },

    passwordRow: { flexDirection: 'row', borderWidth: 1, borderColor: COLORS.gray300, borderRadius: BORDER_RADIUS.md, overflow: 'hidden' },
    eyeBtn: {
        paddingHorizontal: 14, borderLeftWidth: 1, borderLeftColor: COLORS.gray300,
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9',
    },

    button: {
        backgroundColor: '#FF5722', paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: SPACING.sm, marginBottom: SPACING.lg,
        shadowColor: '#FF5722', shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
    },
    adminButton: { backgroundColor: '#1a1a2e' },
    buttonDisabled: { opacity: 0.65 },
    buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

    divider: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
    dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.gray200 },
    dividerText: { fontSize: 12, color: COLORS.textSecondary, marginHorizontal: SPACING.md, fontWeight: '600' },

    signupButton: {
        borderWidth: 2, borderColor: '#FF5722', borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    signupButtonText: { color: '#FF5722', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },

    termsText: { textAlign: 'center', fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
    linkText: { color: '#FF5722', fontWeight: 'bold' },
    hintBox: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#fef9e7', borderRadius: 8, padding: 10,
        marginBottom: SPACING.md, borderWidth: 1, borderColor: '#f59e0b40',
    },
    hintText: { fontSize: 12, color: '#666', flex: 1 },
    hintBold: { fontWeight: 'bold', color: '#1a1a2e' },
});
