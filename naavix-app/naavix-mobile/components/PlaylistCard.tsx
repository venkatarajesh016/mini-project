import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Playlist } from '../data/mockData';
import { usePlayer } from '../context/PlayerContext';
import { Colors, BorderRadius, FontSizes, FontWeights, Spacing } from '../constants/theme';

interface PlaylistCardProps {
    playlist: Playlist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
    const { playPlaylist } = usePlayer();
    const router = useRouter();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push(`/playlist/${playlist.id}`)}
            activeOpacity={0.8}
        >
            <View style={styles.imageWrapper}>
                <Image source={{ uri: playlist.cover }} style={styles.image} />
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => playPlaylist(playlist.songs)}
                >
                    <Ionicons name="play" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
            <Text style={styles.name} numberOfLines={1}>{playlist.name}</Text>
            <Text style={styles.description} numberOfLines={1}>{playlist.description}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 150,
        marginRight: Spacing.lg,
    },
    imageWrapper: {
        position: 'relative',
        marginBottom: Spacing.sm,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: BorderRadius.lg,
    },
    playButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    name: {
        color: Colors.foreground,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.semibold,
    },
    description: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
});
