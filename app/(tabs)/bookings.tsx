// Notifications Screen — Real Backend
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';
import { userApi } from '../../services/api';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'promo';
    isRead: boolean;
    createdAt: string;
}

const getIcon = (type: string): { name: string; color: string } => {
    switch (type) {
        case 'success': return { name: 'checkmark-circle', color: '#4CAF50' };
        case 'promo': return { name: 'gift', color: '#FF9800' };
        case 'warning': return { name: 'alert-circle', color: '#F44336' };
        default: return { name: 'information-circle', color: '#2196F3' };
    }
};

const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
};

export default function NotificationsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await userApi.getNotifications();
            if (res.success && Array.isArray(res.data)) {
                setNotifications(res.data);
            }
        } catch (err) {
            console.warn('Could not fetch notifications', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Load on mount
    useEffect(() => { fetchNotifications(); }, []);

    // Reload whenever screen comes into focus
    useFocusEffect(useCallback(() => { fetchNotifications(); }, []));

    const onRefresh = () => { setRefreshing(true); fetchNotifications(); };

    const markRead = async (id: string) => {
        await userApi.markNotificationRead(id);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    };

    const markAllRead = async () => {
        const unread = notifications.filter(n => !n.isRead);
        await Promise.all(unread.map(n => userApi.markNotificationRead(n._id)));
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                </View>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#FF5722" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <Text style={styles.unreadCount}>{unreadCount} unread</Text>
                    )}
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllRead}>
                        <Text style={styles.markAllRead}>Mark all as read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5722']} />}
            >
                {notifications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={52} color="#ccc" />
                        <Text style={styles.emptyTitle}>No notifications yet</Text>
                        <Text style={styles.emptySubtitle}>You're all caught up! New alerts from the admin will appear here.</Text>
                    </View>
                ) : (
                    notifications.map((item) => {
                        const icon = getIcon(item.type);
                        return (
                            <TouchableOpacity
                                key={item._id}
                                style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
                                onPress={() => !item.isRead && markRead(item._id)}
                                activeOpacity={0.85}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
                                    <Ionicons name={icon.name as any} size={24} color={icon.color} />
                                </View>
                                <View style={styles.contentContainer}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.title}>{item.title}</Text>
                                        <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                                    </View>
                                    <Text style={styles.message}>{item.message}</Text>
                                </View>
                                {!item.isRead && <View style={styles.unreadDot} />}
                            </TouchableOpacity>
                        );
                    })
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>That's all for now!</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
        backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    unreadCount: { fontSize: 12, color: '#FF5722', fontWeight: '600', marginTop: 2 },
    markAllRead: { fontSize: 12, fontWeight: '600', color: '#FF5722' },
    scrollView: { flex: 1 },
    scrollContent: { padding: SPACING.md },
    emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#555', marginTop: 16 },
    emptySubtitle: { fontSize: 13, color: '#999', textAlign: 'center', marginTop: 8, lineHeight: 20 },
    notificationCard: {
        flexDirection: 'row', backgroundColor: COLORS.white,
        padding: SPACING.md, marginBottom: SPACING.sm, borderRadius: 12,
        alignItems: 'flex-start', borderWidth: 1, borderColor: 'transparent',
    },
    unreadCard: { borderColor: '#FF572220', backgroundColor: '#FFFBF9' },
    iconContainer: {
        width: 40, height: 40, borderRadius: 20,
        alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
    },
    contentContainer: { flex: 1 },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 4,
    },
    title: { fontSize: 14, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 8 },
    time: { fontSize: 11, color: '#999' },
    message: { fontSize: 13, color: '#666', lineHeight: 18 },
    unreadDot: {
        width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5722',
        position: 'absolute', top: SPACING.md, right: SPACING.md,
    },
    footer: { paddingVertical: SPACING.lg, alignItems: 'center' },
    footerText: { fontSize: 12, color: '#999' },
});
