import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../data/mockData';
import { usePlayer } from '../context/PlayerContext';
import { Colors, BorderRadius, FontSizes, FontWeights, Spacing } from '../constants/theme';

interface SongListItemProps {
    song: Song;
    index: number;
}

export default function SongListItem({ song, index }: SongListItemProps) {
    const { playSong, currentSong, isPlaying } = usePlayer();
    const isCurrentSong = currentSong?.id === song.id;

    return (
        <TouchableOpacity
            style={[styles.container, isCurrentSong && styles.active]}
            onPress={() => playSong(song)}
            activeOpacity={0.7}
        >
            <View style={styles.indexCol}>
                {isCurrentSong && isPlaying ? (
                    <View style={styles.playingBars}>
                        {[1, 2, 3].map((i) => (
                            <View key={i} style={[styles.bar, { height: 4 + Math.random() * 10 }]} />
                        ))}
                    </View>
                ) : (
                    <Text style={[styles.index, isCurrentSong && styles.activeText]}>{index + 1}</Text>
                )}
            </View>
            <Image source={{ uri: song.cover }} style={styles.image} />
            <View style={styles.info}>
                <Text style={[styles.title, isCurrentSong && styles.activeText]} numberOfLines={1}>
                    {song.title}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
            </View>
            <View style={styles.right}>
                {song.isLiked && (
                    <Ionicons name="heart" size={14} color={Colors.primary} style={{ marginRight: 8 }} />
                )}
                <Text style={styles.duration}>{song.duration}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.md,
    },
    active: {
        backgroundColor: 'rgba(233, 30, 140, 0.1)',
    },
    indexCol: {
        width: 24,
        alignItems: 'center',
    },
    index: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.sm,
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
        width: 2,
        borderRadius: 1,
        backgroundColor: Colors.primary,
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.sm,
    },
    info: {
        flex: 1,
    },
    title: {
        color: Colors.foreground,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.medium,
    },
    artist: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    duration: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.xs,
    },
});
