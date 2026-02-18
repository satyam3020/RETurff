// Notifications Screen
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/theme';

// Mock Notifications Data
const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        title: 'Booking Confirmed! ✅',
        message: 'Your slot for Pickleball Court 2 on 18 Feb is successfully verified.',
        time: '2 mins ago',
        type: 'success',
        read: false,
    },
    {
        id: '2',
        title: 'Sunday Special Offer 🎁',
        message: 'Get flat 10% OFF on all slots booked for this Sunday. Hurry up!',
        time: '2 hours ago',
        type: 'promo',
        read: false,
    },
    {
        id: '3',
        title: 'Wallet Updated 💳',
        message: '₹50 Cashback has been credited to your wallet from your last booking.',
        time: '1 day ago',
        type: 'info',
        read: true,
    },
    {
        id: '4',
        title: 'Maintenance Alert ⚠️',
        message: 'Tennis Court 1 will be under maintenance from 2 PM to 4 PM tomorrow.',
        time: '2 days ago',
        type: 'warning',
        read: true,
    },
];

export default function NotificationsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate fetch
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: '#4CAF50' };
            case 'promo': return { name: 'gift', color: '#FF9800' };
            case 'warning': return { name: 'alert-circle', color: '#F44336' };
            default: return { name: 'information-circle', color: '#2196F3' };
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity>
                    <Text style={styles.markAllRead}>Mark all as read</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} />}
            >
                {notifications.map((item) => {
                    const icon = getIcon(item.type);
                    return (
                        <View key={item.id} style={[styles.notificationCard, !item.read && styles.unreadCard]}>
                            <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
                                <Ionicons name={icon.name as any} size={24} color={icon.color} />
                            </View>
                            <View style={styles.contentContainer}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <Text style={styles.time}>{item.time}</Text>
                                </View>
                                <Text style={styles.message}>{item.message}</Text>
                            </View>
                            {!item.read && <View style={styles.unreadDot} />}
                        </View>
                    );
                })}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>That's all for now!</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    markAllRead: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF5722',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.md,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderRadius: 12,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    unreadCard: {
        borderColor: '#FF572220',
        backgroundColor: '#FFFBF9',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    contentContainer: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 11,
        color: '#999',
    },
    message: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF5722',
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        // Removed marginTop since we act absolute
    },
    footer: {
        paddingVertical: SPACING.lg,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#999',
    },
});
