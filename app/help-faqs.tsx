// Help & FAQs Screen — organized FAQ content with collapsible sections
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── FAQ Data ────────────────────────────────────────────────────────────────
const FAQ_SECTIONS = [
    {
        title: 'About RETurf',
        icon: 'information-circle',
        color: '#FF5722',
        questions: [
            {
                q: 'What is RETurf?',
                a: 'RETurf is an online sports turf booking platform where users can discover, book, and pay for football and cricket slots at nearby venues. It allows players to reserve time slots easily without visiting the venue physically.',
            },
            {
                q: 'How many sports are covered on RETurf?',
                a: 'Currently, RETurf supports Football and Cricket. More sports may be added in the future based on demand.',
            },
            {
                q: 'What kind of sports venues does RETurf cover?',
                a: 'RETurf covers local sports turfs and grounds that offer football and cricket playing facilities. Each venue includes available slots, pricing, and amenities.',
            },
        ],
    },
    {
        title: 'Your Booking',
        icon: 'calendar',
        color: '#3b82f6',
        questions: [
            {
                q: 'How do I discover available sports and venues?',
                a: 'You can browse the home screen to see available sports. Select a sport (Football or Cricket), choose a venue, and check available slots for your preferred date and time.',
            },
            {
                q: 'How do I book a slot?',
                a: '1. Select your sport\n2. Choose a venue\n3. Pick an available date and time slot\n4. Proceed to payment\n5. After successful payment, your booking will be confirmed',
            },
            {
                q: 'Where can I see my bookings?',
                a: 'Go to the My Bookings section in your profile. You can view all upcoming, completed, and cancelled bookings there.',
            },
            {
                q: 'Can I change my booking after confirming it?',
                a: 'Currently, bookings cannot be modified once confirmed. You will need to cancel the existing booking (if eligible) and book a new slot.',
            },
            {
                q: 'I added a slot to my cart but it disappeared. What should I do?',
                a: 'Slots are time-sensitive. If you do not complete the payment within a limited time, the slot may automatically expire and become available to other users.',
            },
            {
                q: 'How do I cancel my booking?',
                a: 'Go to My Bookings, select the booking you want to cancel, and tap on Cancel. Refund eligibility depends on the cancellation policy.',
            },
        ],
    },
    {
        title: 'Slot Status',
        icon: 'time',
        color: '#8b5cf6',
        questions: [
            {
                q: 'What does "Payment Pending" mean?',
                a: 'It means your slot is reserved temporarily but payment has not been completed yet.',
            },
            {
                q: 'What does "Booking Confirmed" mean?',
                a: 'Your payment is successful and your slot is officially reserved.',
            },
            {
                q: 'What does "Slot Expired" mean?',
                a: 'The slot was not paid for within the allowed time and has been released for others to book.',
            },
        ],
    },
    {
        title: 'Payments',
        icon: 'card',
        color: '#10b981',
        questions: [
            {
                q: 'How do I pay for a booking?',
                a: 'You can pay securely using UPI, Debit Card, Credit Card, or Net Banking through the integrated payment gateway.',
            },
            {
                q: 'Is the payment secure?',
                a: 'Yes. All payments are processed through a secure payment gateway with encryption.',
            },
            {
                q: 'Are taxes included in the booking price?',
                a: 'Taxes and convenience fees (if applicable) will be clearly shown before you complete the payment.',
            },
            {
                q: 'What should I do if my money is deducted but booking is not confirmed?',
                a: 'Wait for a few minutes and refresh the booking page. If the issue persists, contact support with your transaction ID.',
            },
        ],
    },
    {
        title: 'Cancellation & Refunds',
        icon: 'cash',
        color: '#ef4444',
        questions: [
            {
                q: 'Will I get a refund if I cancel my booking?',
                a: 'Refunds depend on the venue\'s cancellation policy. If cancellation is done within the allowed time, the refund will be processed to your original payment method.',
            },
            {
                q: 'How long does a refund take?',
                a: 'Refunds usually take 5–7 working days to reflect in your account.',
            },
        ],
    },
    {
        title: 'Profile',
        icon: 'person',
        color: '#f59e0b',
        questions: [
            {
                q: 'How do I edit my profile?',
                a: 'Go to Profile → Edit Profile. You can update your name, phone number, and other details.',
            },
            {
                q: 'How do I change my password?',
                a: 'Go to Profile → Security Settings → Change Password.',
            },
        ],
    },
    {
        title: 'About Sports Venues',
        icon: 'football',
        color: '#06b6d4',
        questions: [
            {
                q: 'I cannot see my preferred venue. What should I do?',
                a: 'If a venue is not listed, it may not be partnered with RETurf yet. You can suggest a venue through the support section.',
            },
            {
                q: 'Where can I see the venue address and amenities?',
                a: 'Open the venue details page. You will find the full address, pricing, and available amenities like parking, washrooms, lighting, etc.',
            },
        ],
    },
];

// ─── FAQ Item Component ──────────────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [expanded, setExpanded] = useState(false);

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <TouchableOpacity style={styles.faqItem} onPress={toggle} activeOpacity={0.7}>
            <View style={styles.faqQuestion}>
                <Text style={styles.faqQText}>{question}</Text>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#aaa"
                />
            </View>
            {expanded && (
                <Text style={styles.faqAnswer}>{answer}</Text>
            )}
        </TouchableOpacity>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HelpFAQScreen() {
    const [expandedSection, setExpandedSection] = useState<number | null>(0);

    const toggleSection = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSection(expandedSection === index ? null : index);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & FAQs</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.heroIconWrap}>
                        <Ionicons name="help-buoy" size={36} color="#FF5722" />
                    </View>
                    <Text style={styles.heroTitle}>How can we help you?</Text>
                    <Text style={styles.heroSubtitle}>
                        Find answers to commonly asked questions below
                    </Text>
                </View>

                {/* Sections */}
                {FAQ_SECTIONS.map((section, sectionIndex) => {
                    const isOpen = expandedSection === sectionIndex;
                    return (
                        <View key={sectionIndex} style={styles.section}>
                            <TouchableOpacity
                                style={styles.sectionHeader}
                                onPress={() => toggleSection(sectionIndex)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.sectionIcon, { backgroundColor: section.color + '12' }]}>
                                    <Ionicons name={section.icon as any} size={20} color={section.color} />
                                </View>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <View style={styles.sectionCount}>
                                    <Text style={styles.sectionCountText}>{section.questions.length}</Text>
                                </View>
                                <Ionicons
                                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color="#ccc"
                                />
                            </TouchableOpacity>

                            {isOpen && (
                                <View style={styles.faqList}>
                                    {section.questions.map((faq, idx) => (
                                        <FAQItem key={idx} question={faq.q} answer={faq.a} />
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* Contact Support CTA */}
                <View style={styles.contactCard}>
                    <MaterialCommunityIcons name="headset" size={28} color="#FF5722" />
                    <View style={styles.contactCardText}>
                        <Text style={styles.contactTitle}>Still need help?</Text>
                        <Text style={styles.contactSubtitle}>Raise a support request and our team will get back to you</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.contactBtn}
                        onPress={() => router.push('/raise-request' as any)}
                    >
                        <Text style={styles.contactBtnText}>Contact Us</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
        paddingVertical: 14, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#222' },

    scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

    // Hero
    hero: { alignItems: 'center', marginBottom: 24 },
    heroIconWrap: {
        width: 68, height: 68, borderRadius: 34, backgroundColor: '#FF572210',
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    heroTitle: { fontSize: 22, fontWeight: '800', color: '#111' },
    heroSubtitle: { fontSize: 13, color: '#999', marginTop: 4 },

    // Section
    section: {
        backgroundColor: '#fff', borderRadius: 14, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
    },
    sectionIcon: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
    },
    sectionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111' },
    sectionCount: {
        backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 10, marginRight: 4,
    },
    sectionCountText: { fontSize: 11, fontWeight: '700', color: '#999' },

    // FAQ list inside section
    faqList: {
        borderTopWidth: 1, borderTopColor: '#f5f5f5',
    },
    faqItem: {
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#f8f8f8',
    },
    faqQuestion: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12,
    },
    faqQText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#333' },
    faqAnswer: {
        marginTop: 10, fontSize: 13, color: '#666', lineHeight: 20,
        paddingRight: 20,
    },

    // Contact CTA
    contactCard: {
        backgroundColor: '#fff', borderRadius: 14, padding: 20, marginTop: 14,
        alignItems: 'center', gap: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
        borderWidth: 1, borderColor: '#FF572215',
    },
    contactCardText: { alignItems: 'center', gap: 4 },
    contactTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
    contactSubtitle: { fontSize: 12, color: '#999', textAlign: 'center' },
    contactBtn: {
        backgroundColor: '#FF5722', paddingHorizontal: 28, paddingVertical: 12,
        borderRadius: 10, marginTop: 4,
    },
    contactBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
