import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../utils/theme';
import { getUserProfile } from '../services/storage';

export default function OTPScreen() {
    const { mobile } = useLocalSearchParams();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(30);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text.length === 1 && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 4) {
            Alert.alert('Invalid OTP', 'Please enter a 4-digit code');
            return;
        }

        // Simulate Auth Verification & Persistence Check
        try {
            // Check if this specific mobile has a completed profile
            const profile = await getUserProfile();

            // For this demo, let's assume if a profile exists and matches the current 'mobile', it's a returning user
            const isReturningUser = profile && profile.mobile === mobile;

            if (isReturningUser) {
                // If they already have a profile, go to main app
                router.replace('/(tabs)');
            } else {
                // If it's a new number, go to profile completion
                router.replace({
                    pathname: '/complete-profile',
                    params: { mobile }
                });
            }
        } catch (e) {
            console.error('Verification failed:', e);
            // Default to profile completion if anything fails
            router.replace({
                pathname: '/complete-profile',
                params: { mobile }
            });
        }
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
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Text style={styles.backButtonText}>{'<'}</Text>
                        </TouchableOpacity>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoIcon}>🏟️</Text>
                            <Text style={styles.logoText}>RETurf</Text>
                            <Text style={styles.tagline}>INDIA'S SPORTS APP</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Section - White Card */}
                <View style={styles.content}>
                    <View style={styles.cardHeader}>
                        <View style={styles.dragHandle} />
                        <Text style={styles.title}>Enter OTP</Text>
                        <Text style={styles.subtitle}>+91 {mobile}</Text>
                    </View>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref: TextInput | null) => { inputRefs.current[index] = ref; }}
                                style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                                maxLength={1}
                                keyboardType="number-pad"
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleVerify}
                    >
                        <Text style={styles.buttonText}>VERIFY →</Text>
                    </TouchableOpacity>

                    <View style={styles.resendContainer}>
                        <Text style={styles.retryText}>Didn't Receive OTP?</Text>
                        <Text style={styles.timerText}>
                            {timer > 0 ? `Resend in 00:${timer.toString().padStart(2, '0')}` : 'Resend Now'}
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FF5722',
    },
    container: {
        flex: 1,
        backgroundColor: '#FF5722',
    },
    header: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 20,
        padding: 10,
    },
    backButtonText: {
        fontSize: 24,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoIcon: {
        fontSize: 40,
        marginBottom: SPACING.sm,
        color: COLORS.white,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: 3,
        marginTop: SPACING.xs,
        fontWeight: '600',
    },
    content: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SPACING.xl,
        flex: 1,
    },
    cardHeader: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.gray200,
        borderRadius: 2,
        position: 'absolute',
        top: -10,
        alignSelf: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.md,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: COLORS.gray400,
        borderRadius: BORDER_RADIUS.md,
        fontSize: 24,
        textAlign: 'center',
        color: COLORS.black,
        backgroundColor: COLORS.white,
    },
    otpInputFilled: {
        borderColor: '#FF5722',
        backgroundColor: '#FFF3E0',
    },
    button: {
        backgroundColor: COLORS.gray200, // Disabled look initially or light gray
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginBottom: SPACING.xl,
        marginTop: SPACING.md,
    },
    buttonText: {
        color: COLORS.white, // Should probably be dynamic/active color
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
        // Overriding for demo to match screenshot roughly
        textShadowColor: 'rgba(0,0,0,0.1)',
    },
    resendContainer: {
        alignItems: 'center',
    },
    retryText: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    timerText: {
        color: '#FF5722',
        fontWeight: 'bold',
    },
});
