import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING } from '../../utils/theme';
import ProfileCompletionModal from '../profile/ProfileCompletionModal';
import { getAuthUser, userApi } from '../../services/api';

export default function ProfileProgressCard() {
    const [modalVisible, setModalVisible] = useState(false);
    const [userName, setUserName] = useState('');
    const [progress, setProgress] = useState(0);
    const [allCompleted, setAllCompleted] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    const loadProgress = useCallback(async () => {
        try {
            // Try backend first, fallback to local cache
            let user;
            try {
                const res = await userApi.getProfile();
                if (res.success) user = res.data;
            } catch { /* ignore */ }
            if (!user) user = await getAuthUser();
            if (!user) return;

            if (user.name) setUserName(user.name);

            // Compute completion
            const checks = [
                !!user.profileImage,                                          // Photo
                (user.promptsAnswered || 0) >= 5,                              // Prompts
                !!user.bio,                                                    // Bio
                !!user.preferences?.age && !!user.preferences?.gender,         // Basic details
                Array.isArray(user.preferences?.interestedSports)
                && user.preferences.interestedSports.length > 0,           // Sports prefs
            ];
            const done = checks.filter(Boolean).length;
            setProgress(Math.round((done / 5) * 100));
            setAllCompleted(done === 5);

            // Check if card was dismissed
            const hidden = await AsyncStorage.getItem('@profile_card_hidden');
            if (hidden === 'true') setIsHidden(true);
            else setIsHidden(false);
        } catch { /* ignore */ }
    }, []);

    // Refresh on every focus (coming back from sub-screens)
    useFocusEffect(useCallback(() => { loadProgress(); }, [loadProgress]));

    const handleDismiss = async () => {
        await AsyncStorage.setItem('@profile_card_hidden', 'true');
        setIsHidden(true);
    };

    // Hidden by user
    if (isHidden) return null;

    // Don't show the card if profile is already complete
    if (allCompleted) {
        return (
            <>
                <View style={styles.container}>
                    <View style={[styles.card, styles.cardCompleted]}>
                        <View style={styles.content}>
                            <Text style={styles.titleCompleted}>🎉 Profile Complete!</Text>
                            <Text style={styles.badgeNotice}>
                                You have earned the <Text style={styles.boldText}>Verified Pro Badge!</Text>
                            </Text>
                        </View>
                        <View style={styles.badgeContainer}>
                            <View style={[styles.badgePlaceholder, styles.badgePlaceholderDone]}>
                                <MaterialCommunityIcons name="shield-check" size={28} color="#fff" />
                                <Text style={styles.verifiedTextDone}>Verified Pro</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={handleDismiss}
                            >
                                <MaterialCommunityIcons name="close" size={12} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </>
        );
    }

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <View style={styles.content}>
                        <Text style={styles.title}>Profile Completion</Text>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${progress}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{progress}%</Text>
                        </View>
                        <Text style={styles.badgeNotice}>
                            Complete your profile to earn the <Text style={styles.boldText}>Verified Pro - Badge!</Text>
                        </Text>
                    </View>

                    <View style={styles.badgeContainer}>
                        <View style={styles.badgePlaceholder}>
                            <MaterialCommunityIcons name="shield-check" size={28} color="#999" />
                            <Text style={styles.verifiedText}>Verified Pro</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <MaterialCommunityIcons name="close" size={12} color="#999" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>

            <ProfileCompletionModal
                visible={modalVisible}
                onClose={() => { setModalVisible(false); loadProgress(); }}
                userName={userName}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.md,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardCompleted: {
        borderColor: '#4CAF50',
        borderWidth: 1.5,
    },
    content: {
        flex: 3,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    titleCompleted: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 8,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressBar: {
        flex: 1,
        height: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        marginRight: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF5722',
        borderRadius: 6,
    },
    progressText: {
        fontSize: 10,
        color: '#666',
        fontWeight: 'bold',
    },
    badgeNotice: {
        fontSize: 10,
        color: '#666',
        lineHeight: 14,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#333',
    },
    badgeContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eee',
        width: 60,
        height: 70,
        borderRadius: 10,
    },
    badgePlaceholderDone: {
        backgroundColor: '#4CAF50',
    },
    badgeIcon: {
        fontSize: 24,
        marginBottom: 2,
    },
    verifiedText: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#999',
        textAlign: 'center',
    },
    verifiedTextDone: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    closeBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#f0f0f0',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeIcon: {
        fontSize: 10,
        color: '#999',
    }
});
