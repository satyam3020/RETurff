import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { clearAuthData, getAuthUser } from '../../services/api';
import { SPACING, BORDER_RADIUS } from '../../utils/theme';

// ─── Menu data ─────────────────────────────────────────────────────────────
const ACTIVITY_MENU = [
    { id: '1', label: 'Your Bookings', icon: 'calendar-check', color: '#FF5722', bg: '#FFF3EF', route: '/bookings' },
    { id: '2', label: 'My Events', icon: 'calendar-star', color: '#7C3AED', bg: '#F3EEFF' },
    { id: '3', label: 'Favourite Venues', icon: 'heart', color: '#E91E63', bg: '#FCE4EC' },
    { id: '4', label: 'RETurf Pass', icon: 'card-account-details', color: '#FF9800', bg: '#FFF8E1' },
];

const SUPPORT_MENU = [
    { id: '5', label: 'Help & FAQs', icon: 'help-circle', color: '#00BCD4', bg: '#E0F7FA' },
    { id: '6', label: 'Raise a Request', icon: 'message-alert', color: '#4CAF50', bg: '#E8F5E9' },
    { id: '7', label: 'Payments & Refunds', icon: 'cash-refund', color: '#3F51B5', bg: '#E8EAF6' },
];

const LEGAL_MENU = [
    { id: 'terms', label: 'Terms & Conditions', icon: 'file-document-outline', color: '#607D8B', bg: '#ECEFF1' },
    { id: 'privacy', label: 'Privacy Policy', icon: 'shield-lock-outline', color: '#607D8B', bg: '#ECEFF1' },
];

// ─── Helper: initials from name ─────────────────────────────────────────────
const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function ProfileScreen() {
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        getAuthUser().then((user) => {
            if (user) {
                if (user.name) setUserName(user.name);
                if (user.phone) setUserPhone(user.phone);
                if (user.email) setUserEmail(user.email);
            }
        });
    }, []);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive',
                onPress: async () => {
                    await clearAuthData();
                    router.replace('/login');
                },
            },
        ]);
    };

    const handleMenuPress = (item: any) => {
        if (item.route) router.push(item.route as any);
    };

    const renderMenuGroup = (items: any[], title: string) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.menuCard}>
                {items.map((item, idx) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.menuRow,
                            idx < items.length - 1 && styles.menuRowBorder,
                        ]}
                        onPress={() => handleMenuPress(item)}
                        activeOpacity={0.75}
                    >
                        <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                            <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
                        </View>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Ionicons name="chevron-forward" size={18} color="#bbb" />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── ORANGE HEADER ──────────────────────────── */}
                <View style={styles.hero}>
                    <View style={styles.heroBubble1} />
                    <View style={styles.heroBubble2} />

                    {/* Settings button top-right */}
                    <TouchableOpacity style={styles.settingsBtn}>
                        <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.85)" />
                    </TouchableOpacity>

                    {/* Avatar with initials */}
                    <View style={styles.avatarRing}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarInitials}>{getInitials(userName)}</Text>
                        </View>
                    </View>

                    <Text style={styles.heroName}>{userName || 'User'}</Text>
                    {userPhone ? (
                        <View style={styles.infoPill}>
                            <Ionicons name="call-outline" size={12} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.infoPillText}>+91 {userPhone}</Text>
                        </View>
                    ) : null}
                    {userEmail ? (
                        <View style={[styles.infoPill, { marginTop: 4 }]}>
                            <Ionicons name="mail-outline" size={12} color="rgba(255,255,255,0.9)" />
                            <Text style={styles.infoPillText}>{userEmail}</Text>
                        </View>
                    ) : null}

                    {/* Edit profile chip */}
                    <TouchableOpacity style={styles.editChip}>
                        <Ionicons name="create-outline" size={14} color="#FF5722" />
                        <Text style={styles.editChipText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* ── STATS ROW ────────────────────────────────── */}
                <View style={styles.statsRow}>
                    {[
                        { label: 'Bookings', value: '0', icon: 'calendar-check', color: '#FF5722' },
                        { label: 'Events', value: '0', icon: 'trophy-outline', color: '#7C3AED' },
                        { label: 'Venues', value: '0', icon: 'heart-outline', color: '#E91E63' },
                    ].map((stat, i) => (
                        <View key={i} style={styles.statItem}>
                            <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ── MENU GROUPS ──────────────────────────────── */}
                {renderMenuGroup(ACTIVITY_MENU, 'My Activity')}
                {renderMenuGroup(SUPPORT_MENU, 'Support')}
                {renderMenuGroup(LEGAL_MENU, 'Legal')}

                {/* ── LOGOUT ───────────────────────────────────── */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                        <Ionicons name="log-out-outline" size={20} color="#E53935" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* App version */}
                <Text style={styles.versionText}>RETurf v1.0.0</Text>
                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F5F5F5' },

    // ── Hero ────────────────────────────────────────────
    hero: {
        backgroundColor: '#FF5722',
        paddingTop: 20,
        paddingBottom: 32,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    heroBubble1: {
        position: 'absolute', width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -60,
    },
    heroBubble2: {
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        backgroundColor: 'rgba(255,255,255,0.06)', bottom: -50, left: -40,
    },
    settingsBtn: {
        position: 'absolute', top: 16, right: 16, zIndex: 10,
        padding: 8,
    },

    avatarRing: {
        width: 92, height: 92, borderRadius: 46,
        borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center', justifyContent: 'center',
    },
    avatarInitials: {
        fontSize: 28, fontWeight: 'bold', color: '#fff',
    },
    heroName: {
        fontSize: 22, fontWeight: 'bold', color: '#fff',
        marginBottom: 6, letterSpacing: 0.3,
    },
    infoPill: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 12, paddingVertical: 4,
        borderRadius: 20,
    },
    infoPillText: {
        fontSize: 12, color: 'rgba(255,255,255,0.95)', fontWeight: '500',
    },
    editChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 7,
        borderRadius: 20, marginTop: 14,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
    },
    editChipText: { fontSize: 13, fontWeight: '700', color: '#FF5722' },

    // ── Stats ───────────────────────────────────────────
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 16,
        paddingVertical: 16,
        marginTop: -20,
        shadowColor: '#FF5722',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 8,
    },
    statItem: {
        flex: 1, alignItems: 'center', gap: 4,
    },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#222' },
    statLabel: { fontSize: 11, color: '#999', fontWeight: '500' },

    // ── Sections & Menu ────────────────────────────────
    section: { marginHorizontal: 16, marginTop: 16 },
    sectionTitle: {
        fontSize: 12, fontWeight: '700', color: '#999',
        letterSpacing: 1, textTransform: 'uppercase',
        marginBottom: 8, marginLeft: 4,
    },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    menuRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 16, gap: 14,
    },
    menuRowBorder: {
        borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    },
    menuIconBox: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    menuLabel: {
        flex: 1, fontSize: 14, fontWeight: '500', color: '#222',
    },

    // ── Logout ──────────────────────────────────────────
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, backgroundColor: '#FFF',
        paddingVertical: 15, borderRadius: 16,
        borderWidth: 1.5, borderColor: '#FFCDD2',
        shadowColor: '#E53935', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
    },
    logoutText: {
        fontSize: 15, fontWeight: '700', color: '#E53935',
    },

    versionText: {
        textAlign: 'center', fontSize: 11,
        color: '#ccc', marginTop: 20,
    },
});
