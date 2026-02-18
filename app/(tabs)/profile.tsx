import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getUserProfile } from '../../services/storage';
import { COLORS, SPACING } from '../../utils/theme';

interface MenuItem {
    id: string;
    label: string;
    icon: string;
    iconLibrary: 'MaterialCommunityIcons' | 'Ionicons';
    route?: string;
}

const MENU_ITEMS: MenuItem[] = [
    { id: '1', label: 'Your Bookings', icon: 'calendar-check', iconLibrary: 'MaterialCommunityIcons', route: '/bookings' },
    { id: '2', label: 'My Events', icon: 'calendar-star', iconLibrary: 'MaterialCommunityIcons' },
    { id: '3', label: 'Favourite Venues', icon: 'heart', iconLibrary: 'MaterialCommunityIcons' },
    { id: '4', label: 'Your KheloMore Pass', icon: 'card-account-details', iconLibrary: 'MaterialCommunityIcons' },
    { id: '5', label: 'Help and FAQs', icon: 'help-circle', iconLibrary: 'MaterialCommunityIcons' },
    { id: '6', label: 'Raise a Request', icon: 'message-alert', iconLibrary: 'MaterialCommunityIcons' },
    { id: '7', label: 'Payments & Refunds', icon: 'cash-refund', iconLibrary: 'MaterialCommunityIcons' },
];

const FOOTER_LINKS: MenuItem[] = [
    { id: 'terms', label: 'Terms and Conditions', icon: 'file-document', iconLibrary: 'MaterialCommunityIcons' },
    { id: 'privacy', label: 'Privacy Policy', icon: 'shield-lock', iconLibrary: 'MaterialCommunityIcons' },
];

export default function ProfileScreen() {
    const [userName, setUserName] = useState('Suraj');
    const [credits, setCredits] = useState(0);

    useEffect(() => {
        const loadProfile = async () => {
            const profile = await getUserProfile();
            if (profile?.name) {
                setUserName(profile.name);
            }
        };
        loadProfile();
    }, []);

    const handleMenuPress = (item: MenuItem) => {
        if (item.route) {
            router.push(item.route as any);
        }
    };

    const handleLogout = () => {
        // TODO: Implement logout logic
        console.log('Logout pressed');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header with User Info */}
                <View style={styles.header}>
                    <View style={styles.userSection}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={40} color="#999" />
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{userName}</Text>
                            <Text style={styles.userStatus}>Last Played: Yet To Play</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>VIEW</Text>
                    </TouchableOpacity>
                </View>

                {/* Credits Card */}
                <View style={styles.creditsCard}>
                    <View style={styles.creditsContent}>
                        <Text style={styles.creditsTitle}>RETurf Credits</Text>
                        <Text style={styles.creditsAmount}>₹ {credits}</Text>
                    </View>
                    <View style={styles.creditsBadge}>
                        <MaterialCommunityIcons name="trophy" size={32} color="#FFB300" />
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {MENU_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => handleMenuPress(item)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuItemLeft}>
                                {item.iconLibrary === 'MaterialCommunityIcons' ? (
                                    <MaterialCommunityIcons name={item.icon as any} size={20} color="#666" />
                                ) : (
                                    <Ionicons name={item.icon as any} size={20} color="#666" />
                                )}
                                <Text style={styles.menuItemText}>{item.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#999" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Footer Links */}
                <View style={styles.footerLinks}>
                    {FOOTER_LINKS.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.footerLink}
                            onPress={() => handleMenuPress(item)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.footerLinkText}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={18} color="#999" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>LOGOUT</Text>
                </TouchableOpacity>

                {/* Bottom padding for tab bar */}
                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3F2FD',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        paddingTop: SPACING.md,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#D0D0D0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    userStatus: {
        fontSize: 12,
        color: '#666',
    },
    viewButton: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    viewButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    creditsCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
        padding: SPACING.lg,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    creditsContent: {
        flex: 1,
    },
    creditsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    creditsAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    creditsBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF8E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuSection: {
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: SPACING.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuItemText: {
        fontSize: 14,
        color: '#333',
        marginLeft: SPACING.md,
    },
    footerLinks: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    footerLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
    },
    footerLinkText: {
        fontSize: 13,
        color: '#666',
    },
    logoutButton: {
        marginHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        letterSpacing: 0.5,
    },
});
