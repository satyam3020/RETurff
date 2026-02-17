import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    SafeAreaView,
    ScrollView,
    Platform,
    Dimensions,
    Animated,
    FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../utils/theme';
import { saveUserProfile } from '../services/storage';

const { width, height } = Dimensions.get('window');

type Step = 'SUCCESS' | 'NAME_GENDER' | 'AGE_EMAIL' | 'SPORTS';

const SPORTS = [
    { id: '1', name: 'Cricket', icon: '🏏', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=200' },
    { id: '2', name: 'Football', icon: '⚽', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200' },
    { id: '3', name: 'Badminton', icon: '🏸', image: 'https://images.unsplash.com/photo-1626225967045-2c76b22c4ec1?w=200' },
    { id: '4', name: 'Pickleball', icon: '🎾', image: 'https://images.unsplash.com/photo-1612872081303-346747d34177?w=200' },
    { id: '5', name: 'Padel', icon: '👟', image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=200' },
];

export default function CompleteProfileScreen() {
    const { mobile } = useLocalSearchParams();
    const [currentStep, setCurrentStep] = useState<Step>('SUCCESS');
    const [name, setName] = useState('');
    const [gender, setGender] = useState('Male');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');
    const [selectedSports, setSelectedSports] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        runAnimation();
        if (currentStep === 'SUCCESS') {
            setTimeout(() => {
                handleNext();
            }, 2000);
        }
    }, [currentStep]);

    const runAnimation = () => {
        fadeAnim.setValue(0);
        slideAnim.setValue(20);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    };

    const handleNext = () => {
        if (currentStep === 'SUCCESS') setCurrentStep('NAME_GENDER');
        else if (currentStep === 'NAME_GENDER') setCurrentStep('AGE_EMAIL');
        else if (currentStep === 'AGE_EMAIL') setCurrentStep('SPORTS');
        else handleComplete();
    };

    const handleBack = () => {
        if (currentStep === 'SPORTS') setCurrentStep('AGE_EMAIL');
        else if (currentStep === 'AGE_EMAIL') setCurrentStep('NAME_GENDER');
    };

    const handleComplete = async () => {
        const userProfile = {
            id: `user-${mobile}`,
            name,
            email,
            mobile: mobile as string,
            preferences: {
                age: parseInt(age),
                gender,
                interestedSports: selectedSports,
            }
        };

        await saveUserProfile(userProfile as any);
        router.replace('/(tabs)');
    };

    const toggleSport = (sportId: string) => {
        if (selectedSports.includes(sportId)) {
            setSelectedSports(selectedSports.filter(id => id !== sportId));
        } else {
            setSelectedSports([...selectedSports, sportId]);
        }
    };

    const renderSuccess = () => (
        <View style={styles.centerContent}>
            <View style={styles.successIconContainer}>
                <View style={styles.tickOutRing}>
                    <View style={styles.tickCircle}>
                        <Text style={styles.tickText}>✓</Text>
                    </View>
                </View>
                {/* Decorative dots could be added here */}
            </View>
        </View>
    );

    const renderNameGender = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Complete Profile</Text>
            <Text style={styles.largeTitle}>Let's setup your profile!</Text>
            <Text style={styles.subtitle}>Tell us a bit about yourself to start your game journey</Text>

            <View style={styles.formCard}>
                <Text style={styles.inputLabel}>What's Your Name!</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Sam"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={[styles.inputLabel, { marginTop: SPACING.xl }]}>Which gender best describes you?</Text>
                <View style={styles.radioGroup}>
                    {['Male', 'Female', 'Other'].map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={styles.radioButton}
                            onPress={() => setGender(option)}
                        >
                            <View style={[styles.radioCircle, gender === option && styles.radioActive]}>
                                {gender === option && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonIcon}>→</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderAgeEmail = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Complete Profile</Text>
            <Text style={styles.largeTitle}>Let's setup your profile!</Text>
            <Text style={styles.subtitle}>Tell us a bit about yourself to start your game journey</Text>

            <View style={styles.tabbedCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardHeaderText}>Profile Details</Text>
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.inputLabel}>What age are you still winning at?</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter Your Age"
                        keyboardType="number-pad"
                        value={age}
                        onChangeText={setAge}
                    />

                    <Text style={[styles.inputLabel, { marginTop: SPACING.xl }]}>Email</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter Your Email"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>
            </View>

            <View style={styles.navigationFooter}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonIcon}>→</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSports = () => {
        const filteredSports = SPORTS.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Complete Profile</Text>
                <Text style={styles.largeTitle}>Select the sports you play!</Text>
                <Text style={styles.subtitle}>Pick one or more sports you're interested in.</Text>

                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search sports"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView style={styles.sportsList}>
                    {filteredSports.map((sport) => (
                        <TouchableOpacity
                            key={sport.id}
                            style={[styles.sportItem, selectedSports.includes(sport.id) && styles.sportItemActive]}
                            onPress={() => toggleSport(sport.id)}
                        >
                            <View style={styles.sportInfo}>
                                <Text style={styles.sportName}>{sport.name}</Text>
                            </View>
                            <View style={styles.sportImageContainer}>
                                <Image source={{ uri: sport.image }} style={styles.sportThumb} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View style={styles.sportsFooter}>
                    <TouchableOpacity style={styles.skipBtn} onPress={handleComplete}>
                        <Text style={styles.skipBtnText}>SKIP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.continueBtn, selectedSports.length > 0 && styles.continueBtnActive]}
                        onPress={handleComplete}
                    >
                        <Text style={styles.continueBtnText}>CONTINUE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                {currentStep === 'SUCCESS' && renderSuccess()}
                {currentStep === 'NAME_GENDER' && renderNameGender()}
                {currentStep === 'AGE_EMAIL' && renderAgeEmail()}
                {currentStep === 'SPORTS' && renderSports()}
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tickOutRing: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 87, 34, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tickCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FF5722',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#FF7043',
    },
    tickText: {
        fontSize: 50,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    stepContainer: {
        flex: 1,
        padding: SPACING.xl,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
    },
    stepTitle: {
        fontSize: 18,
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginBottom: SPACING.xxl,
        fontWeight: '600',
    },
    largeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: SPACING.xl,
    },
    formCard: {
        marginTop: SPACING.lg,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF5722',
        marginBottom: SPACING.md,
    },
    textInput: {
        fontSize: 18,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray300,
        paddingVertical: SPACING.sm,
        color: COLORS.black,
    },
    radioGroup: {
        marginTop: SPACING.md,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.gray400,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    radioActive: {
        borderColor: '#FF5722',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF5722',
    },
    radioLabel: {
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    tabbedCard: {
        marginTop: SPACING.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 87, 34, 0.2)',
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardHeader: {
        backgroundColor: '#FFF5F2',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 87, 34, 0.1)',
    },
    cardHeaderText: {
        fontSize: 14,
        color: '#FF5722',
        fontWeight: 'bold',
    },
    cardBody: {
        padding: SPACING.xl,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        right: 30,
    },
    navigationFooter: {
        position: 'absolute',
        bottom: 50,
        width: width - 60,
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nextButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FF5722',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButtonIcon: {
        fontSize: 28,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    backButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.gray200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        fontSize: 28,
        color: COLORS.textPrimary,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray100,
        borderRadius: 25,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.lg,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    sportsList: {
        flex: 1,
    },
    sportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.sm,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    sportItemActive: {
        borderColor: '#FF5722',
        backgroundColor: '#FFF5F2',
    },
    sportName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    sportInfo: {
        flex: 1,
    },
    sportImageContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    sportThumb: {
        width: '100%',
        height: '100%',
    },
    sportsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.lg,
    },
    skipBtn: {
        flex: 1,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.gray300,
        borderRadius: 12,
    },
    skipBtnText: {
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    continueBtn: {
        flex: 2,
        height: 52,
        backgroundColor: COLORS.gray300,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    continueBtnActive: {
        backgroundColor: '#FF5722',
    },
    continueBtnText: {
        fontWeight: 'bold',
        color: COLORS.white,
    },
});
