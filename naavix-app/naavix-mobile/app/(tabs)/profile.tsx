import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Gradients } from '../../constants/theme';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const stats = [
        { icon: 'musical-notes' as const, label: 'Songs Played', value: '1,234' },
        { icon: 'heart' as const, label: 'Liked Songs', value: '89' },
        { icon: 'list' as const, label: 'Playlists', value: '12' },
        { icon: 'time' as const, label: 'Listening Time', value: '48h' },
    ];

    const menuItems = [
        { icon: 'person-outline' as const, label: 'Edit Profile', onPress: () => { } },
        { icon: 'settings-outline' as const, label: 'Settings', onPress: () => { } },
        { icon: 'log-out-outline' as const, label: 'Logout', onPress: () => { logout(); router.replace('/(auth)/login'); }, destructive: true },
    ];

    if (!user) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loginPrompt}>
                    <Ionicons name="person-circle-outline" size={80} color={Colors.mutedForeground} />
                    <Text style={styles.loginPromptText}>Sign in to see your profile</Text>
                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <LinearGradient
                            colors={[...Gradients.naavix]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginBtnGradient}
                        >
                            <Text style={styles.loginBtnText}>Sign In</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header Gradient */}
                <LinearGradient
                    colors={[...Gradients.naavixGlow, Colors.background]}
                    style={styles.headerGradient}
                >
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    </View>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                </LinearGradient>

                {/* Stats */}
                <View style={styles.statsGrid}>
                    {stats.map((stat) => (
                        <View key={stat.label} style={styles.statCard}>
                            <Ionicons name={stat.icon} size={22} color={Colors.primary} />
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Menu */}
                <View style={styles.menu}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[
                                styles.menuItem,
                                index !== menuItems.length - 1 && styles.menuItemBorder,
                            ]}
                            onPress={item.onPress}
                        >
                            <Ionicons
                                name={item.icon}
                                size={20}
                                color={item.destructive ? Colors.destructive : Colors.foreground}
                            />
                            <Text
                                style={[
                                    styles.menuLabel,
                                    item.destructive && styles.menuLabelDestructive,
                                ]}
                            >
                                {item.label}
                            </Text>
                            <Ionicons name="chevron-forward" size={18} color={Colors.mutedForeground} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 140 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
    },
    loginPrompt: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.lg,
    },
    loginPromptText: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.lg,
    },
    loginBtn: {
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginTop: Spacing.md,
    },
    loginBtnGradient: {
        paddingHorizontal: Spacing['3xl'],
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.xl,
    },
    loginBtnText: {
        color: '#fff',
        fontSize: FontSizes.md,
        fontWeight: FontWeights.semibold,
    },
    headerGradient: {
        alignItems: 'center',
        paddingTop: Spacing['4xl'],
        paddingBottom: Spacing['3xl'],
    },
    avatarContainer: {
        marginBottom: Spacing.lg,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: 'rgba(233, 30, 140, 0.3)',
    },
    userName: {
        fontSize: FontSizes['2xl'],
        fontWeight: FontWeights.bold,
        color: Colors.foreground,
        marginBottom: Spacing.xs,
    },
    userEmail: {
        fontSize: FontSizes.sm,
        color: Colors.mutedForeground,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: Spacing['2xl'],
        gap: Spacing.md,
        marginTop: -Spacing.lg,
    },
    statCard: {
        width: '47%',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius['2xl'],
        padding: Spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statValue: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.bold,
        color: Colors.foreground,
        marginTop: Spacing.sm,
    },
    statLabel: {
        fontSize: FontSizes.xs,
        color: Colors.mutedForeground,
        marginTop: Spacing.xs,
    },
    menu: {
        marginHorizontal: Spacing['2xl'],
        marginTop: Spacing['3xl'],
        backgroundColor: Colors.card,
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        gap: Spacing.lg,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuLabel: {
        flex: 1,
        color: Colors.foreground,
        fontSize: FontSizes.base,
        fontWeight: FontWeights.medium,
    },
    menuLabelDestructive: {
        color: Colors.destructive,
    },
});
