import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../data/mockData';
import { usePlayer } from '../context/PlayerContext';
import { Colors, BorderRadius, FontSizes, FontWeights, Spacing } from '../constants/theme';

interface SongCardProps {
    song: Song;
    variant?: 'default' | 'compact';
}

export default function SongCard({ song, variant = 'default' }: SongCardProps) {
    const { playSong, currentSong, isPlaying } = usePlayer();
    const isCurrentSong = currentSong?.id === song.id;

    if (variant === 'compact') {
        return (
            <TouchableOpacity
                style={[styles.compactContainer, isCurrentSong && styles.compactActive]}
                onPress={() => playSong(song)}
                activeOpacity={0.7}
            >
                <Image source={{ uri: song.cover }} style={styles.compactImage} />
                <View style={styles.compactInfo}>
                    <Text style={[styles.compactTitle, isCurrentSong && styles.activeText]} numberOfLines={1}>
                        {song.title}
                    </Text>
                    <Text style={styles.compactArtist} numberOfLines={1}>{song.artist}</Text>
                </View>
                {isCurrentSong && isPlaying && (
                    <View style={styles.playingBars}>
                        {[1, 2, 3].map((i) => (
                            <View key={i} style={[styles.bar, { height: 4 + Math.random() * 12 }]} />
                        ))}
                    </View>
                )}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={styles.defaultContainer} onPress={() => playSong(song)} activeOpacity={0.8}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: song.cover }} style={styles.defaultImage} />
                <View style={styles.playOverlay}>
                    <Ionicons name="play" size={20} color="#fff" />
                </View>
            </View>
            <Text style={[styles.defaultTitle, isCurrentSong && styles.activeText]} numberOfLines={1}>
                {song.title}
            </Text>
            <Text style={styles.defaultArtist} numberOfLines={1}>{song.artist}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: BorderRadius.lg,
        gap: Spacing.md,
    },
    compactActive: {
        backgroundColor: 'rgba(233, 30, 140, 0.1)',
    },
    compactImage: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
    },
    compactInfo: {
        flex: 1,
    },
    compactTitle: {
        color: Colors.foreground,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.medium,
    },
    compactArtist: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
    activeText: {
        color: Colors.primary,
    },
    playingBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
        height: 16,
    },
    bar: {
        width: 3,
        borderRadius: 2,
        backgroundColor: Colors.primary,
    },
    defaultContainer: {
        width: 150,
        marginRight: Spacing.lg,
    },
    imageWrapper: {
        position: 'relative',
        marginBottom: Spacing.sm,
    },
    defaultImage: {
        width: 150,
        height: 150,
        borderRadius: BorderRadius.lg,
    },
    playOverlay: {
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
    defaultTitle: {
        color: Colors.foreground,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.semibold,
    },
    defaultArtist: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
});
