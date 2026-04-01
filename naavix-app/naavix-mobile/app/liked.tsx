import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { teluguSongs } from '../data/mockData';
import { usePlayer } from '../context/PlayerContext';
import SongListItem from '../components/SongListItem';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Gradients } from '../constants/theme';

export default function LikedSongsScreen() {
    const likedSongs = teluguSongs.filter((song) => song.isLiked);
    const { playPlaylist } = usePlayer();
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
                </TouchableOpacity>

                {/* Header */}
                <LinearGradient
                    colors={[...Gradients.purplePink, Colors.background]}
                    style={styles.header}
                >
                    <LinearGradient
                        colors={[...Gradients.naavix]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heartContainer}
                    >
                        <Ionicons name="heart" size={60} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.label}>PLAYLIST</Text>
                    <Text style={styles.title}>Liked Songs</Text>
                    <Text style={styles.count}>{likedSongs.length} songs you love</Text>
                </LinearGradient>

                {/* Play Button */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => playPlaylist(likedSongs)}
                        style={styles.playBtnWrapper}
                    >
                        <LinearGradient
                            colors={[...Gradients.naavix]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.playBtn}
                        >
                            <Ionicons name="play" size={24} color="#fff" style={{ marginLeft: 2 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Song List */}
                <View style={styles.songList}>
                    {likedSongs.map((song, index) => (
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
    heartContainer: {
        width: 140,
        height: 140,
        borderRadius: BorderRadius['2xl'],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    label: {
        fontSize: FontSizes.xs,
        fontWeight: FontWeights.semibold,
        color: Colors.primary,
        letterSpacing: 2,
        marginBottom: Spacing.sm,
    },
    title: {
        fontSize: FontSizes['3xl'],
        fontWeight: FontWeights.bold,
        color: Colors.foreground,
        marginBottom: Spacing.sm,
    },
    count: {
        fontSize: FontSizes.sm,
        color: Colors.mutedForeground,
    },
    actions: {
        paddingHorizontal: Spacing['2xl'],
        paddingVertical: Spacing.lg,
    },
    playBtnWrapper: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 6,
        alignSelf: 'flex-start',
    },
    playBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    songList: {
        paddingHorizontal: Spacing.sm,
    },
});
