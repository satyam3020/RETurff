import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../utils/theme';

export default function LoginScreen() {
    const [mobileNumber, setMobileNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = () => {
        if (mobileNumber.length !== 10) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            // Navigate to OTP screen (passing params if needed)
            router.push({
                pathname: '/otp',
                params: { mobile: mobileNumber }
            });
        }, 1000);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <StatusBar style="light" />

                {/* Top Section - Orange Branding */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        {/* Simple Text Logo for now */}
                        <Text style={styles.logoIcon}>🏟️</Text>
                        <Text style={styles.logoText}>RETurf</Text>
                        <Text style={styles.tagline}>INDIA'S SPORTS APP</Text>
                    </View>

                    {/* Background decorative circles could go here */}
                    <View style={styles.circleDecoration} />
                </View>

                {/* Bottom Section - White Card */}
                <View style={styles.content}>
                    <View style={styles.cardHeader}>
                        <View style={styles.dragHandle} />
                        <Text style={styles.title}>Let's sign you in!</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mobile Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex. 9000000000"
                            keyboardType="number-pad"
                            maxLength={10}
                            value={mobileNumber}
                            onChangeText={setMobileNumber}
                            placeholderTextColor={COLORS.gray400}
                        />
                        <Text style={styles.helperText}>
                            A 4-digit code will be sent to your mobile number to verify you're really you!
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSendOTP}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'SENDING...' : 'SEND OTP'}</Text>
                    </TouchableOpacity>

                    <Text style={styles.termsText}>
                        By tapping 'Send OTP', you agree to RETurf's {'\n'}
                        <Text style={styles.linkText}>Terms & Conditions</Text>
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FF5722', // Orange background matches header
    },
    container: {
        flex: 1,
        backgroundColor: '#FF5722', // Orange background
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    logoContainer: {
        alignItems: 'center',
        zIndex: 10,
    },
    logoIcon: {
        fontSize: 48,
        marginBottom: SPACING.sm,
        color: COLORS.white,
    },
    logoText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: COLORS.white,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: 4,
        marginTop: SPACING.xs,
        fontWeight: '600',
    },
    circleDecoration: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -100,
        right: -100,
    },
    content: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SPACING.xl,
        paddingBottom: SPACING.xxl * 2,
        flex: 0.8, // Take up bottom 45% approx
    },
    cardHeader: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.gray200,
        borderRadius: 2,
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    inputContainer: {
        marginBottom: SPACING.xl,
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.gray300,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    helperText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
        lineHeight: 18,
    },
    button: {
        backgroundColor: '#FF5722',
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    termsText: {
        textAlign: 'center',
        fontSize: 12,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    linkText: {
        color: '#FF5722',
        fontWeight: 'bold',
    },
});
