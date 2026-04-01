import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Gradients } from '../../constants/theme';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { signup, isLoading } = useAuth();
    const router = useRouter();

    const passwordStrength = () => {
        if (password.length === 0) return { score: 0, label: '', color: 'transparent' };
        if (password.length < 6) return { score: 1, label: 'Weak', color: Colors.destructive };
        if (password.length < 10) return { score: 2, label: 'Medium', color: Colors.orange };
        if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
            return { score: 3, label: 'Strong', color: Colors.green };
        }
        return { score: 2, label: 'Medium', color: Colors.orange };
    };

    const strength = passwordStrength();

    const handleSubmit = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setError('');
            await signup(name, email, password);
            router.replace('/(tabs)');
        } catch (err) {
            setError('Signup failed. Please try again.');
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
                <View style={styles.glowContainer}>
                    <View style={[styles.glow, styles.glowOrange]} />
                    <View style={[styles.glow, styles.glowPurple]} />
                </View>

                <View style={styles.card}>
                    <View style={styles.logoArea}>
                        <LinearGradient
                            colors={[...Gradients.naavix]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.logoCircle}
                        >
                            <Ionicons name="musical-notes" size={32} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join Naavix for free</Text>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="warning" size={18} color={Colors.destructive} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Name */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={Colors.mutedForeground} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your name"
                                placeholderTextColor={Colors.mutedForeground}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Email</Text>
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
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.mutedForeground} />
                            <TextInput
                                style={styles.input}
                                placeholder="Create a password"
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
                        {/* Strength Indicator */}
                        {password.length > 0 && (
                            <View style={styles.strengthContainer}>
                                <View style={styles.strengthBars}>
                                    {[1, 2, 3].map((level) => (
                                        <View
                                            key={level}
                                            style={[
                                                styles.strengthBar,
                                                { backgroundColor: strength.score >= level ? strength.color : Colors.muted },
                                            ]}
                                        />
                                    ))}
                                </View>
                                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                                    {strength.label}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={Colors.mutedForeground} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm your password"
                                placeholderTextColor={Colors.mutedForeground}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                            />
                            {confirmPassword.length > 0 && (
                                <Ionicons
                                    name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                                    size={20}
                                    color={password === confirmPassword ? Colors.green : Colors.destructive}
                                />
                            )}
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={[styles.submitBtn, ((password !== confirmPassword || password.length < 6) || isLoading) && styles.submitBtnDisabled]}
                        activeOpacity={0.8}
                        disabled={password !== confirmPassword || password.length < 6 || isLoading}
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
                                <Text style={styles.submitBtnText}>Create Account</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Sign In Link */}
                    <View style={styles.bottomLink}>
                        <Text style={styles.bottomText}>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>Sign in</Text>
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
        right: '10%',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    glowPurple: {
        bottom: -50,
        left: '10%',
        backgroundColor: 'rgba(109, 40, 217, 0.15)',
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
        marginBottom: Spacing['2xl'],
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSizes['2xl'],
        fontWeight: FontWeights.bold,
        color: Colors.foreground,
    },
    subtitle: {
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
    strengthContainer: {
        marginTop: Spacing.sm,
    },
    strengthBars: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 4,
    },
    strengthBar: {
        flex: 1,
        height: 3,
        borderRadius: 2,
    },
    strengthLabel: {
        fontSize: FontSizes.xs,
    },
    submitBtn: {
        marginTop: Spacing.lg,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
    },
    submitBtnDisabled: {
        opacity: 0.5,
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
