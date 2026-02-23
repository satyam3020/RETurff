import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../utils/theme';
import ProfileCompletionModal from '../profile/ProfileCompletionModal';
import { getAuthUser } from '../../services/api';

export default function ProfileProgressCard() {
    const [modalVisible, setModalVisible] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        getAuthUser().then((user) => {
            if (user?.name) setUserName(user.name);
        });
    }, []);

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
                                <View style={[styles.progressFill, { width: '40%' }]} />
                            </View>
                            <Text style={styles.progressText}>40%</Text>
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
                onClose={() => setModalVisible(false)}
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
    content: {
        flex: 3,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
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
