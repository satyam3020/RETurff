import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';

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
    userName = 'Suraj',
}: ProfileCompletionModalProps) {
    const [tasks, setTasks] = useState<ProfileTask[]>([
        {
            id: '1',
            title: 'Add Profile Photo',
            description: 'Upload a photo for your profile',
            icon: 'account-circle',
            completed: false,
            actionText: 'Upload',
        },
        {
            id: '2',
            title: 'Answer 5 Prompts (0/5)',
            description: 'Prompts Help Generate Your Bio',
            icon: 'text-box-edit-outline',
            completed: false,
            actionText: 'Answer',
        },
        {
            id: '3',
            title: 'Create your Bio',
            description: 'Generate a bio with AI',
            icon: 'auto-fix',
            completed: false,
            actionText: 'Generate',
        },
        {
            id: '4',
            title: 'Add Basic Details',
            description: '',
            icon: 'check-circle',
            completed: true,
        },
        {
            id: '5',
            title: 'Select Your Sports Preferences',
            description: '',
            icon: 'check-circle',
            completed: true,
        },
    ]);

    const completedCount = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const progress = (completedCount / totalTasks) * 100;
    const remainingTasks = totalTasks - completedCount;

    const handleTaskAction = (taskId: string) => {
        // Navigate to respective screen based on task
        switch (taskId) {
            case '1': // Add Profile Photo
                router.push('/profile/upload-photo');
                break;
            case '2': // Answer 5 Prompts
                router.push('/profile/answer-prompts');
                break;
            case '3': // Create Bio
                router.push('/profile/generate-bio');
                break;
            default:
                console.log('Task action:', taskId);
        }
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
                        <View style={styles.avatar}>
                            <MaterialCommunityIcons name="account" size={40} color="#999" />
                        </View>
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
                                <Text style={styles.completionTitle}>Complete your profile</Text>
                                <Text style={styles.completionSubtitle}>
                                    {remainingTasks} steps away from Verified Pro
                                </Text>
                            </View>
                            <View style={styles.badgeContainer}>
                                <View style={styles.badge}>
                                    <MaterialCommunityIcons name="shield-check" size={28} color="#999" />
                                </View>
                                <Text style={styles.badgeLabel}>Verified Pro</Text>
                            </View>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${progress}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
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
                                                <Text style={styles.taskTitle}>{task.title}</Text>
                                                {task.description ? (
                                                    <Text style={styles.taskDescription}>
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
                                    </View>
                                    {index < tasks.length - 1 && <View style={styles.taskDivider} />}
                                </View>
                            ))}
                        </View>

                        {/* Footer Message */}
                        <Text style={styles.footerMessage}>
                            Finish {remainingTasks} task to Complete Your Profile.
                        </Text>

                        {/* Maybe Later Button */}
                        <TouchableOpacity style={styles.maybeLaterButton} onPress={onClose}>
                            <Text style={styles.maybeLaterText}>Maybe Later</Text>
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
    badgeLabel: {
        fontSize: 9,
        color: '#666',
        fontWeight: '600',
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
