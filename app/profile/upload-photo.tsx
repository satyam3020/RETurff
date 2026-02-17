// Profile Photo Upload Screen
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, SPACING } from '../../utils/theme';

export default function UploadPhotoScreen() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleSelectPhoto = () => {
        // In a real app, this would open image picker
        // For now, just set a placeholder
        setSelectedImage('https://via.placeholder.com/200');
    };

    const handleUpload = () => {
        if (selectedImage) {
            // Upload logic here
            console.log('Uploading photo...');
            router.back();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Profile Photo</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>Upload a photo for your profile</Text>

                {/* Photo Preview */}
                <View style={styles.photoContainer}>
                    {selectedImage ? (
                        <Image source={{ uri: selectedImage }} style={styles.photo} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <MaterialCommunityIcons name="camera" size={48} color="#999" />
                        </View>
                    )}
                </View>

                {/* Select Photo Button */}
                <TouchableOpacity style={styles.selectButton} onPress={handleSelectPhoto}>
                    <MaterialCommunityIcons name="image" size={20} color={COLORS.white} />
                    <Text style={styles.selectButtonText}>
                        {selectedImage ? 'Change Photo' : 'Select Photo'}
                    </Text>
                </TouchableOpacity>

                {/* Upload Button */}
                {selectedImage && (
                    <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                        <Text style={styles.uploadButtonText}>Upload & Continue</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: SPACING.lg,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 40,
    },
    photoContainer: {
        marginBottom: 40,
    },
    photo: {
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    photoPlaceholder: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#FF5722',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    selectButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
    },
    uploadButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 8,
    },
    uploadButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
    },
});
