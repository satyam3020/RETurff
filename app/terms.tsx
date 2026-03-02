// Terms & Conditions Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const SECTIONS = [
    {
        title: '1. Acceptance of Terms',
        content:
            'By downloading, accessing, or using the RETurf mobile application ("App"), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use the App.',
    },
    {
        title: '2. Eligibility',
        content:
            'You must be at least 13 years of age to use RETurf. By using the App, you represent and warrant that you meet this eligibility requirement and have the legal capacity to enter into these Terms.',
    },
    {
        title: '3. Account Registration',
        content:
            'To access certain features, you must create an account by providing your name, phone number, email, and a password. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use.',
    },
    {
        title: '4. Booking & Payment',
        content:
            '• Bookings are subject to availability and confirmation.\n• Once a booking is confirmed and payment is made, it is considered final.\n• Prices displayed include the venue\'s base rate. Taxes and convenience fees, if applicable, will be shown before payment.\n• Payments are processed through a secure third-party payment gateway. RETurf does not store your card or banking details.\n• Slot reservations are time-sensitive — unpaid reservations may expire automatically.',
    },
    {
        title: '5. Cancellation & Refund Policy',
        content:
            '• Cancellation policies vary by venue and will be displayed at the time of booking.\n• If you cancel within the permitted time window, a refund will be processed to your original payment method.\n• Refunds typically take 5–7 working days to reflect in your account.\n• RETurf reserves the right to cancel bookings due to unforeseen circumstances (e.g., weather, venue maintenance). In such cases, a full refund will be issued.',
    },
    {
        title: '6. User Conduct',
        content:
            'You agree not to:\n• Use the App for any unlawful purpose\n• Provide false or misleading information\n• Attempt to interfere with the App\'s functionality\n• Harass, abuse, or harm other users or venue staff\n• Use automated systems (bots, scrapers) to access the App\n\nViolation of these rules may result in account suspension or termination.',
    },
    {
        title: '7. Venue Responsibilities',
        content:
            'RETurf acts as a booking platform and is not responsible for the condition, quality, or safety of the sports venues listed. Venue partners are independently responsible for maintaining their facilities and honoring confirmed bookings.',
    },
    {
        title: '8. Intellectual Property',
        content:
            'All content in the App — including logos, text, graphics, and software — is the property of RETurf or its licensors and is protected by applicable intellectual property laws. You may not copy, modify, or distribute any content without prior written consent.',
    },
    {
        title: '9. Limitation of Liability',
        content:
            'RETurf is provided "as is" without warranties of any kind. To the maximum extent permitted by law, RETurf shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App, including but not limited to loss of data, profits, or personal injury at venue premises.',
    },
    {
        title: '10. Modifications to Terms',
        content:
            'RETurf reserves the right to update or modify these Terms at any time. Changes will be posted within the App and take effect upon posting. Continued use of the App after changes constitutes acceptance of the updated Terms.',
    },
    {
        title: '11. Governing Law',
        content:
            'These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.',
    },
    {
        title: '12. Contact Us',
        content:
            'If you have questions about these Terms, please contact us:\n\n📧 Email: support@returf.com\n📱 In-App: Profile → Raise a Request',
    },
];

export default function TermsScreen() {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Last updated */}
                <Text style={styles.updated}>Last updated: 1 March 2026</Text>

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
    updated: { fontSize: 12, color: '#999', marginBottom: 16, textAlign: 'center' },
    section: {
        backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 8 },
    sectionContent: { fontSize: 13.5, color: '#555', lineHeight: 21 },
});
