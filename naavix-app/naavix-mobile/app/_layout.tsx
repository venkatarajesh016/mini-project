import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { PlayerProvider } from '../context/PlayerContext';
import { AuthProvider } from '../context/AuthContext';
import MiniPlayer from '../components/MiniPlayer';
import { Colors } from '../constants/theme';

export default function RootLayout() {
    return (
        <AuthProvider>
            <PlayerProvider>
                <StatusBar style="light" />
                <View style={{ flex: 1, backgroundColor: Colors.background }}>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: Colors.background },
                            animation: 'slide_from_right',
                        }}
                    >
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="playlist/[id]" options={{ animation: 'slide_from_bottom' }} />
                        <Stack.Screen name="liked" options={{ animation: 'slide_from_bottom' }} />
                    </Stack>
                    <MiniPlayer />
                </View>
            </PlayerProvider>
        </AuthProvider>
    );
}
