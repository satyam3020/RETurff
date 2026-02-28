import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';
import { getAuthUser, userApi } from '../../services/api';

interface ProfileTask {
    id: string;
    title: string;
    description: string;
    icon: string;
    completed: boolean;
    actionText?: string;
}

interface ProfileCompletionModalProps {
    visible: boolean;
    onClose: () => void;
    userName?: string;
}

export default function ProfileCompletionModal({
    visible,
    onClose,
    userName = '',
}: ProfileCompletionModalProps) {
    const [tasks, setTasks] = useState<ProfileTask[]>([]);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Refresh user data every time modal becomes visible
    const loadUserData = useCallback(async () => {
        if (!visible) return;
        setLoading(true);
        try {
            // Try backend first for latest data
            const res = await userApi.getProfile();
            const user = res.success ? res.data : await getAuthUser();
            if (!user) { setLoading(false); return; }

            // Set profile image
            if (user.profileImage) setProfileImage(user.profileImage);
            else setProfileImage(null);

            // Compute dynamic task completion
            const hasPhoto = !!user.profileImage;
            const promptsDone = (user.promptsAnswered || 0) >= 5;
            const hasBio = !!user.bio;
            const hasBasicDetails =
                !!user.preferences?.age && !!user.preferences?.gender;
            const hasSportsPrefs =
                Array.isArray(user.preferences?.interestedSports) &&
                user.preferences.interestedSports.length > 0;

            const promptCount = user.promptsAnswered || 0;

            setTasks([
                {
                    id: '1',
                    title: 'Add Profile Photo',
                    description: hasPhoto ? 'Photo uploaded ✓' : 'Upload a photo for your profile',
                    icon: hasPhoto ? 'check-circle' : 'account-circle',
                    completed: hasPhoto,
                    actionText: hasPhoto ? undefined : 'Upload',
                },
                {
                    id: '2',
                    title: `Answer 5 Prompts (${promptCount}/5)`,
                    description: promptsDone ? 'All prompts answered ✓' : 'Prompts Help Generate Your Bio',
                    icon: promptsDone ? 'check-circle' : 'text-box-edit-outline',
                    completed: promptsDone,
                    actionText: promptsDone ? undefined : 'Answer',
                },
                {
                    id: '3',
                    title: 'Create your Bio',
                    description: hasBio ? 'Bio saved ✓' : 'Generate a bio with AI',
                    icon: hasBio ? 'check-circle' : 'auto-fix',
                    completed: hasBio,
                    actionText: hasBio ? undefined : 'Generate',
                },
                {
                    id: '4',
                    title: 'Add Basic Details',
                    description: hasBasicDetails ? 'Details added ✓' : 'Add age & gender',
                    icon: hasBasicDetails ? 'check-circle' : 'card-account-details-outline',
                    completed: hasBasicDetails,
                    actionText: hasBasicDetails ? undefined : 'Add',
                },
                {
                    id: '5',
                    title: 'Select Your Sports Preferences',
                    description: hasSportsPrefs ? 'Sports selected ✓' : 'Choose your favourite sports',
                    icon: hasSportsPrefs ? 'check-circle' : 'basketball',
                    completed: hasSportsPrefs,
                    actionText: hasSportsPrefs ? undefined : 'Select',
                },
            ]);
        } catch {
            // fallback: keep whatever state we have
        } finally {
            setLoading(false);
        }
    }, [visible]);

    // Refresh whenever modal opens or screen focuses
    useFocusEffect(useCallback(() => { loadUserData(); }, [loadUserData]));

    const completedCount = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length || 5;
    const progress = (completedCount / totalTasks) * 100;
    const remainingTasks = totalTasks - completedCount;
    const allCompleted = completedCount === totalTasks && totalTasks > 0;

    const handleTaskAction = (taskId: string) => {
        onClose(); // Close modal first so user sees the new screen
        setTimeout(() => {
            switch (taskId) {
                case '1':
                    router.push('/profile/upload-photo');
                    break;
                case '2':
                    router.push('/profile/answer-prompts');
                    break;
                case '3':
                    router.push('/profile/generate-bio');
                    break;
                case '4':
                    router.push('/profile/basic-details');
                    break;
                case '5':
                    router.push('/profile/sports-preferences');
                    break;
                default:
                    break;
            }
        }, 300);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* User Header - Part of background */}
                <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatar}>
                                <MaterialCommunityIcons name="account" size={40} color="#999" />
                            </View>
                        )}
                        <View>
                            <Text style={styles.userName}>{userName}</Text>
                            <Text style={styles.lastPlayed}>Last Played: Yet To Play</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.viewButton}>VIEW</Text>
                    </TouchableOpacity>
                </View>

                {/* White Card with Profile Completion */}
                <View style={styles.modalCard}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.completionTitle}>
                                    {allCompleted ? '🎉 Profile Complete!' : 'Complete your profile'}
                                </Text>
                                <Text style={styles.completionSubtitle}>
                                    {allCompleted
                                        ? 'You are now a Verified Pro!'
                                        : `${remainingTasks} step${remainingTasks !== 1 ? 's' : ''} away from Verified Pro`}
                                </Text>
                            </View>
                            <View style={styles.badgeContainer}>
                                <View style={[
                                    styles.badge,
                                    allCompleted && styles.badgeCompleted,
                                ]}>
                                    <MaterialCommunityIcons
                                        name="shield-check"
                                        size={28}
                                        color={allCompleted ? '#fff' : '#999'}
                                    />
                                </View>
                                <Text style={[
                                    styles.badgeLabel,
                                    allCompleted && styles.badgeLabelCompleted,
                                ]}>
                                    Verified Pro
                                </Text>
                            </View>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[
                                    styles.progressFill,
                                    { width: `${progress}%` },
                                    allCompleted && styles.progressFillCompleted,
                                ]} />
                            </View>
                            <Text style={[
                                styles.progressText,
                                allCompleted && { color: '#4CAF50' },
                            ]}>
                                {Math.round(progress)}%
                            </Text>
                        </View>

                        {/* Tasks List */}
                        <View style={styles.tasksList}>
                            {tasks.map((task, index) => (
                                <View key={task.id}>
                                    <View style={styles.taskItem}>
                                        <View style={styles.taskLeft}>
                                            <View style={[
                                                styles.taskIcon,
                                                task.completed && styles.taskIconCompleted
                                            ]}>
                                                <MaterialCommunityIcons
                                                    name={task.icon as any}
                                                    size={24}
                                                    color={task.completed ? '#4CAF50' : '#333'}
                                                />
                                            </View>
                                            <View style={styles.taskInfo}>
                                                <Text style={[
                                                    styles.taskTitle,
                                                    task.completed && styles.taskTitleCompleted,
                                                ]}>
                                                    {task.title}
                                                </Text>
                                                {task.description ? (
                                                    <Text style={[
                                                        styles.taskDescription,
                                                        task.completed && { color: '#4CAF50' },
                                                    ]}>
                                                        {task.description}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </View>

                                        {task.actionText && !task.completed && (
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => handleTaskAction(task.id)}
                                            >
                                                <Text style={styles.actionButtonText}>
                                                    {task.actionText}
                                                </Text>
                                                <Ionicons name="chevron-forward" size={16} color="#666" />
                                            </TouchableOpacity>
                                        )}

                                        {task.completed && (
                                            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                        )}
                                    </View>
                                    {index < tasks.length - 1 && <View style={styles.taskDivider} />}
                                </View>
                            ))}
                        </View>

                        {/* Footer Message */}
                        <Text style={[
                            styles.footerMessage,
                            allCompleted && { color: '#4CAF50', fontWeight: '600' },
                        ]}>
                            {allCompleted
                                ? '✅ All tasks completed! You are Verified Pro.'
                                : `Finish ${remainingTasks} task${remainingTasks !== 1 ? 's' : ''} to Complete Your Profile.`}
                        </Text>

                        {/* Maybe Later Button */}
                        <TouchableOpacity style={styles.maybeLaterButton} onPress={onClose}>
                            <Text style={styles.maybeLaterText}>
                                {allCompleted ? 'Close' : 'Maybe Later'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Bottom Section - Payments & Refunds */}
                <TouchableOpacity style={styles.bottomSection}>
                    <View style={styles.bottomSectionContent}>
                        <MaterialCommunityIcons name="wallet-outline" size={20} color="#666" />
                        <Text style={styles.bottomSectionText}>Payments & Refunds</Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#D0D0D0',
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        paddingTop: 50,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#B0B0B0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    lastPlayed: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    viewButton: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    modalCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        borderRadius: 16,
        padding: SPACING.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    completionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    completionSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    badgeContainer: {
        alignItems: 'center',
    },
    badge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    badgeCompleted: {
        backgroundColor: '#4CAF50',
    },
    badgeLabel: {
        fontSize: 9,
        color: '#666',
        fontWeight: '600',
    },
    badgeLabelCompleted: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: SPACING.lg,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FF5722',
        borderRadius: 4,
    },
    progressFillCompleted: {
        backgroundColor: '#4CAF50',
    },
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        minWidth: 40,
    },
    tasksList: {
        marginBottom: SPACING.md,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
    },
    taskLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    taskIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskIconCompleted: {
        backgroundColor: '#E8F5E9',
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    taskTitleCompleted: {
        color: '#4CAF50',
    },
    taskDescription: {
        fontSize: 12,
        color: '#999',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: COLORS.white,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    taskDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 56,
    },
    footerMessage: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
        marginTop: SPACING.sm,
        marginBottom: SPACING.md,
    },
    maybeLaterButton: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    maybeLaterText: {
        fontSize: 16,
        color: '#CCC',
        fontWeight: '500',
    },
    bottomSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E8E8E8',
        marginHorizontal: SPACING.lg,
        marginVertical: SPACING.md,
        padding: SPACING.md,
        borderRadius: 8,
    },
    bottomSectionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    bottomSectionText: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
    },
});
