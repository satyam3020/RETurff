// 404 Not Found Screen
import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/theme';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View style={styles.container}>
                <Text style={styles.emoji}>🤔</Text>
                <Text style={styles.title}>Screen not found</Text>
                <Link href="/" style={styles.link}>
                    <Text style={styles.linkText}>Go to home screen</Text>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.background,
    },
    emoji: {
        fontSize: 64,
        marginBottom: SPACING.lg,
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
    link: {
        paddingVertical: SPACING.sm,
    },
    linkText: {
        ...TYPOGRAPHY.body,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
