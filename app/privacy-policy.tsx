// Privacy Policy Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const SECTIONS = [
    {
        title: '1. Information We Collect',
        content:
            'We collect the following types of information when you use RETurf:\n\n' +
            '• Personal Information: Name, phone number, email address, and profile photo provided during registration.\n' +
            '• Booking Information: Venue selections, slot bookings, dates, times, and payment history.\n' +
            '• Device Information: Device type, operating system, unique device identifiers, and app version.\n' +
            '• Usage Data: How you interact with the App, features used, pages viewed, and session duration.',
    },
    {
        title: '2. How We Use Your Information',
        content:
            'We use the information we collect to:\n\n' +
            '• Create and manage your account\n' +
            '• Process bookings and payments\n' +
            '• Send booking confirmations and reminders\n' +
            '• Provide customer support\n' +
            '• Improve and personalize the App experience\n' +
            '• Send promotional offers and updates (with your consent)\n' +
            '• Comply with legal obligations',
    },
    {
        title: '3. Information Sharing',
        content:
            'We do not sell your personal data. We may share your information with:\n\n' +
            '• Venue Partners: Your name and phone number are shared with venues for booking purposes.\n' +
            '• Payment Processors: To securely process your transactions.\n' +
            '• Service Providers: Third-party services that help us operate the App (e.g., cloud hosting, analytics).\n' +
            '• Legal Authorities: When required by law or to protect our rights.',
    },
    {
        title: '4. Data Security',
        content:
            'We take data security seriously and implement industry-standard measures to protect your information:\n\n' +
            '• Encrypted data transmission (HTTPS/TLS)\n' +
            '• Secure password hashing (bcrypt)\n' +
            '• JWT-based authentication with token expiry\n' +
            '• Regular security audits\n\n' +
            'However, no system is 100% secure. We encourage you to use a strong, unique password for your account.',
    },
    {
        title: '5. Data Retention',
        content:
            'We retain your personal information for as long as your account is active or as needed to provide services. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., transaction records).',
    },
    {
        title: '6. Your Rights',
        content:
            'You have the right to:\n\n' +
            '• Access: Request a copy of your personal data.\n' +
            '• Correction: Update or correct inaccurate information via Edit Profile.\n' +
            '• Deletion: Request deletion of your account and associated data.\n' +
            '• Opt-out: Unsubscribe from promotional communications at any time.\n\n' +
            'To exercise these rights, contact us through the in-app support or email.',
    },
    {
        title: '7. Cookies & Tracking',
        content:
            'The App may use local storage and analytics tools to improve performance and user experience. These do not collect personally identifiable information unless you are logged in.',
    },
    {
        title: '8. Third-Party Links',
        content:
            'The App may contain links to third-party websites or services. RETurf is not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.',
    },
    {
        title: '9. Children\'s Privacy',
        content:
            'RETurf is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such data collection, we will delete the information promptly.',
    },
    {
        title: '10. Changes to This Policy',
        content:
            'We may update this Privacy Policy from time to time. Changes will be posted within the App with the updated effective date. Continued use of the App after changes constitutes your acceptance of the revised policy.',
    },
    {
        title: '11. Contact Us',
        content:
            'If you have questions or concerns about this Privacy Policy, please contact us:\n\n' +
            '📧 Email: privacy@returf.com\n' +
            '📱 In-App: Profile → Raise a Request\n' +
            '📍 Address: Mumbai, Maharashtra, India',
    },
];

export default function PrivacyPolicyScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Last updated */}
                <Text style={styles.updated}>Last updated: 1 March 2026</Text>

                <View style={styles.introCard}>
                    <Ionicons name="shield-checkmark" size={24} color="#10b981" />
                    <Text style={styles.introText}>
                        Your privacy is important to us. This policy explains how RETurf collects, uses, and protects your personal information.
                    </Text>
                </View>

                {SECTIONS.map((section, i) => (
                    <View key={i} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
        paddingVertical: 14, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#222' },
    scrollContent: { padding: 16 },
    updated: { fontSize: 12, color: '#999', marginBottom: 12, textAlign: 'center' },
    introCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#ecfdf5', borderRadius: 12, padding: 14, marginBottom: 14,
        borderWidth: 1, borderColor: '#10b98120',
    },
    introText: { flex: 1, fontSize: 13, color: '#065f46', lineHeight: 19 },
    section: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 8 },
    sectionContent: { fontSize: 13.5, color: '#555', lineHeight: 21 },
});
