import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Gradients } from '../../constants/theme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const router = useRouter();

    const handleSubmit = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setError('');
            await login(email, password);
            router.replace('/(tabs)');
        } catch (err) {
            setError('Login failed. Please try again.');
            console.error(err);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Background Glow Effects */}
                <View style={styles.glowContainer}>
                    <View style={[styles.glow, styles.glowOrange]} />
                    <View style={[styles.glow, styles.glowPurple]} />
                    <View style={[styles.glow, styles.glowMagenta]} />
                </View>

                {/* Glass Card */}
                <View style={styles.card}>
                    {/* Logo Area */}
                    <View style={styles.logoArea}>
                        <LinearGradient
                            colors={[...Gradients.naavix]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.logoCircle}
                        >
                            <Ionicons name="musical-notes" size={32} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        <Text style={styles.subtitleText}>Sign in to continue to Naavix</Text>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning" size={18} color={Colors.destructive} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Email Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Email or Username</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={Colors.mutedForeground} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor={Colors.mutedForeground}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                        </View>
                    </View>

                    {/* Password Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.mutedForeground} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor={Colors.mutedForeground}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={Colors.mutedForeground}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sign In Button */}
                    <TouchableOpacity 
                        onPress={handleSubmit} 
                        style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]} 
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={[...Gradients.naavix]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitBtnGradient}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitBtnText}>Sign In</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Buttons */}
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialBtn}>
                            <Ionicons name="logo-google" size={20} color={Colors.foreground} />
                            <Text style={styles.socialText}>Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialBtn}>
                            <Ionicons name="logo-apple" size={20} color={Colors.foreground} />
                            <Text style={styles.socialText}>Apple</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.bottomLink}>
                        <Text style={styles.bottomText}>Don't have an account? </Text>
                        <Link href="/(auth)/signup" asChild>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>Sign up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: Colors.background },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing['2xl'],
    },
    glowContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    glowOrange: {
        top: -50,
        left: '10%',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    glowPurple: {
        bottom: -50,
        right: '10%',
        backgroundColor: 'rgba(109, 40, 217, 0.15)',
    },
    glowMagenta: {
        top: '40%',
        left: '30%',
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(233, 30, 140, 0.08)',
    },
    card: {
        backgroundColor: 'rgba(18, 18, 18, 0.7)',
        borderRadius: BorderRadius['3xl'],
        padding: Spacing['3xl'],
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    logoArea: {
        alignItems: 'center',
        marginBottom: Spacing['3xl'],
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    welcomeText: {
        fontSize: FontSizes['2xl'],
        fontWeight: FontWeights.bold,
        color: Colors.foreground,
    },
    subtitleText: {
        fontSize: FontSizes.sm,
        color: Colors.mutedForeground,
        marginTop: Spacing.sm,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        gap: Spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: Colors.destructive,
    },
    errorText: {
        color: Colors.destructive,
        fontSize: FontSizes.sm,
        flex: 1,
    },
    fieldContainer: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.medium,
        color: Colors.foreground,
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(31, 31, 31, 0.5)',
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.lg,
        height: 50,
        gap: Spacing.md,
    },
    input: {
        flex: 1,
        color: Colors.foreground,
        fontSize: FontSizes.base,
    },
    submitBtn: {
        marginTop: Spacing.lg,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    submitBtnGradient: {
        height: 50,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        color: '#fff',
        fontSize: FontSizes.md,
        fontWeight: FontWeights.semibold,
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing['2xl'],
        gap: Spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.sm,
    },
    socialRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    socialBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.sm,
    },
    socialText: {
        color: Colors.foreground,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.medium,
    },
    bottomLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing['2xl'],
    },
    bottomText: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.sm,
    },
    linkText: {
        color: Colors.primary,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.semibold,
    },
});
