import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { playlists, teluguSongs } from '../../data/mockData';
import { usePlayer } from '../../context/PlayerContext';
import SongListItem from '../../components/SongListItem';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Gradients } from '../../constants/theme';

export default function PlaylistDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const playlist = playlists.find((p) => p.id === id) || playlists[0];
    const { playPlaylist } = usePlayer();
    const router = useRouter();

    const songs = playlist.songs.length > 0 ? playlist.songs : teluguSongs.slice(0, 10);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                </TouchableOpacity>

                {/* Header */}
                <LinearGradient
                    colors={[...Gradients.naavixGlow, Colors.background]}
                    style={styles.header}
                >
                    <View style={styles.coverContainer}>
                        <Image source={{ uri: playlist.cover }} style={styles.coverImage} />
                    </View>
                    <Text style={styles.playlistLabel}>PLAYLIST</Text>
                    <Text style={styles.playlistName}>{playlist.name}</Text>
                    <Text style={styles.playlistDescription}>{playlist.description}</Text>
                    <Text style={styles.metaText}>
                        Naavix • {songs.length} songs • About 45 min
                    </Text>
                </LinearGradient>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => playPlaylist(songs)}
                        style={styles.playBtn}
                    >
                        <LinearGradient
                            colors={[...Gradients.naavix]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.playBtnGradient}
                        >
                            <Ionicons name="play" size={24} color="#fff" style={{ marginLeft: 2 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="shuffle" size={22} color={Colors.foreground} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="heart-outline" size={22} color={Colors.foreground} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="download-outline" size={22} color={Colors.foreground} />
                    </TouchableOpacity>
                </View>

                {/* Song List */}
                <View style={styles.songList}>
                    {songs.map((song, index) => (
                        <SongListItem key={song.id} song={song} index={index} />
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
    backBtn: {
        position: 'absolute',
        top: Spacing.lg,
        left: Spacing.lg,
        zIndex: 10,
        padding: Spacing.sm,
    },
    header: {
        alignItems: 'center',
        paddingTop: Spacing['5xl'],
        paddingBottom: Spacing['2xl'],
        paddingHorizontal: Spacing['2xl'],
    },
    coverContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
        marginBottom: Spacing.lg,
    },
    coverImage: {
        width: 200,
        height: 200,
        borderRadius: BorderRadius['2xl'],
    },
    playlistLabel: {
        fontSize: FontSizes.xs,
        fontWeight: FontWeights.semibold,
        color: Colors.primary,
        letterSpacing: 2,
        marginBottom: Spacing.sm,
    },
    playlistName: {
        fontSize: FontSizes['3xl'],
        fontWeight: FontWeights.bold,
        color: Colors.foreground,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    playlistDescription: {
        fontSize: FontSizes.sm,
        color: Colors.mutedForeground,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    metaText: {
        fontSize: FontSizes.xs,
        color: Colors.mutedForeground,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing['2xl'],
        paddingVertical: Spacing.lg,
        gap: Spacing.lg,
    },
    playBtn: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
    },
    playBtnGradient: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    songList: {
        paddingHorizontal: Spacing.sm,
    },
});
