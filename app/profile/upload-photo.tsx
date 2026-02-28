// Profile Photo Upload Screen — fully functional with expo-image-picker
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING } from '../../utils/theme';
import { userApi, saveAuthData, getAuthToken, getAuthUser } from '../../services/api';

export default function UploadPhotoScreen() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Load existing profile image on mount
    useEffect(() => {
        getAuthUser().then((user) => {
            if (user?.profileImage) {
                setCurrentImage(user.profileImage);
            }
        });
    }, []);

    const pickFromGallery = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow access to your photo gallery.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
            setSelectedImage(base64Uri);
        }
    };

    const pickFromCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow access to your camera.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
            setSelectedImage(base64Uri);
        }
    };

    const handleSelectPhoto = () => {
        Alert.alert('Select Photo', 'Choose an option', [
            { text: 'Camera', onPress: pickFromCamera },
            { text: 'Gallery', onPress: pickFromGallery },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleUpload = async () => {
        if (!selectedImage) return;
        setUploading(true);
        try {
            const res = await userApi.updateProfile({ profileImage: selectedImage });
            if (res.success) {
                // Update locally stored user data so other screens pick it up immediately
                const token = await getAuthToken();
                if (token && res.data) {
                    await saveAuthData(token, res.data);
                }
                Alert.alert('Success', 'Profile photo updated!', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            } else {
                Alert.alert('Error', res.message || 'Failed to upload photo.');
            }
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Something went wrong.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePhoto = async () => {
        Alert.alert('Remove Photo', 'Are you sure you want to remove your profile photo?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive', onPress: async () => {
                    setUploading(true);
                    try {
                        const res = await userApi.updateProfile({ profileImage: '' });
                        if (res.success) {
                            const token = await getAuthToken();
                            if (token && res.data) {
                                await saveAuthData(token, res.data);
                            }
                            setSelectedImage(null);
                            setCurrentImage(null);
                            Alert.alert('Done', 'Profile photo removed.');
                        }
                    } catch (e: any) {
                        Alert.alert('Error', e.message || 'Failed to remove photo.');
                    } finally {
                        setUploading(false);
                    }
                },
            },
        ]);
    };

    const displayImage = selectedImage || currentImage;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile Photo</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>
                    {displayImage ? 'Looking good! You can change or remove your photo.' : 'Add a photo so others can recognize you.'}
                </Text>

                {/* Photo Preview */}
                <TouchableOpacity style={styles.photoContainer} onPress={handleSelectPhoto} activeOpacity={0.8}>
                    {displayImage ? (
                        <Image source={{ uri: displayImage }} style={styles.photo} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <MaterialCommunityIcons name="camera-plus" size={52} color="#aaa" />
                            <Text style={styles.placeholderText}>Tap to add photo</Text>
                        </View>
                    )}
                    {/* Camera badge */}
                    <View style={styles.cameraBadge}>
                        <MaterialCommunityIcons name="camera" size={18} color="#fff" />
                    </View>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.buttonGroup}>
                    <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
                        <MaterialCommunityIcons name="image-multiple" size={20} color="#fff" />
                        <Text style={styles.galleryBtnText}>Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cameraBtn} onPress={pickFromCamera}>
                        <MaterialCommunityIcons name="camera" size={20} color="#fff" />
                        <Text style={styles.cameraBtnText}>Camera</Text>
                    </TouchableOpacity>
                </View>

                {/* Upload Button - Shows when new image selected */}
                {selectedImage && (
                    <TouchableOpacity
                        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                        onPress={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload" size={20} color="#fff" />
                                <Text style={styles.uploadButtonText}>Save Photo</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* Remove Photo option */}
                {currentImage && !selectedImage && (
                    <TouchableOpacity style={styles.removeBtn} onPress={handleRemovePhoto}>
                        <Ionicons name="trash-outline" size={18} color="#E53935" />
                        <Text style={styles.removeBtnText}>Remove Photo</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 32,
        paddingHorizontal: SPACING.lg,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    photoContainer: {
        marginBottom: 32,
        position: 'relative',
    },
    photo: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 3,
        borderColor: '#FF5722',
    },
    photoPlaceholder: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    placeholderText: {
        marginTop: 8,
        fontSize: 13,
        color: '#aaa',
        fontWeight: '500',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF5722',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    galleryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#7C3AED',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 2,
    },
    galleryBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    cameraBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FF5722',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 2,
    },
    cameraBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 25,
        elevation: 3,
        marginBottom: 16,
    },
    uploadButtonDisabled: {
        opacity: 0.7,
    },
    uploadButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    removeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 12,
        marginTop: 8,
    },
    removeBtnText: {
        fontSize: 14,
        color: '#E53935',
        fontWeight: '600',
    },
});
