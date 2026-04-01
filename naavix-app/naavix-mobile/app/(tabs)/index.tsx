import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { teluguSongs, playlists, artists, albums, Song } from '../../data/mockData';
import SongCard from '../../components/SongCard';
import PlaylistCard from '../../components/PlaylistCard';
import ArtistCard from '../../components/ArtistCard';
import { Colors, FontSizes, FontWeights, Spacing, Gradients, BorderRadius } from '../../constants/theme';
import { songAPI } from '../../services/api';
import { normalizeSongs } from '../../services/normalizeSong';

export default function HomeScreen() {
    const [songs, setSongs] = useState<Song[]>(teluguSongs);
    const [topSongs, setTopSongs] = useState<Song[]>([]);
    const [isLoadingTop, setIsLoadingTop] = useState(false);

    useEffect(() => {
        fetchTopSongs();
    }, []);

    const fetchTopSongs = async () => {
        try {
            setIsLoadingTop(true);
            const result = await songAPI.getTrendingTeluguSongs();
            
            if (result.success && result.songs && result.songs.length > 0) {
                console.log('🎵 Fetched trending songs from external API:', result.count);
                const normalizedSongs = normalizeSongs(result.songs, result.source);
                setTopSongs(normalizedSongs);
            } else {
                console.log('📊 No trending songs from external API, using mock data');
                setTopSongs(teluguSongs.slice(0, 6));
            }
        } catch (error) {
            console.error('Error fetching trending songs:', error);
            // Fall back to mock data
            setTopSongs(teluguSongs.slice(0, 6));
        } finally {
            setIsLoadingTop(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const recentlyPlayed = topSongs.length > 0 ? topSongs : teluguSongs.slice(0, 6);
    const recommendedSongs = songs.slice(2, Math.min(8, songs.length));
    const trendingSongs = songs.slice(4, Math.min(10, songs.length));
    const newReleases = songs.slice(10, Math.min(15, songs.length));

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Hero Header */}
                <LinearGradient
                    colors={['rgba(233, 30, 140, 0.25)', 'rgba(10, 10, 10, 0.8)', Colors.background]}
                    style={styles.hero}
                >
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                    <Text style={styles.subtitle}>Let's find something for you to enjoy</Text>
                </LinearGradient>

                {/* Top 6 Recent Telugu Songs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Top 6 Trending in Telugu</Text>
                    <View style={styles.recentGrid}>
                        {recentlyPlayed.map((song) => (
                            <View key={song.id} style={styles.recentItem}>
                                <SongCard song={song} variant="compact" />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Your Playlists */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Playlists</Text>
                    <FlatList
                        data={playlists.slice(0, 5)}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.horizontalList}
                        renderItem={({ item }) => <PlaylistCard playlist={item} />}
                    />
                </View>

                {/* Recommended */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommended for You</Text>
                    <FlatList
                        data={recommendedSongs}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.horizontalList}
                        renderItem={({ item }) => <SongCard song={item} />}
                    />
                </View>

                {/* Popular Artists */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Popular Artists</Text>
                    <FlatList
                        data={artists}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.horizontalList}
                        renderItem={({ item }) => <ArtistCard artist={item} />}
                    />
                </View>

                {/* Trending */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trending Now 🔥</Text>
                    <FlatList
                        data={trendingSongs}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.horizontalList}
                        renderItem={({ item }) => <SongCard song={item} />}
                    />
                </View>

                {/* New Releases */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>New Releases</Text>
                    <FlatList
                        data={newReleases}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.horizontalList}
                        renderItem={({ item }) => <SongCard song={item} />}
                    />
                </View>

                {/* Top Albums */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Top Albums</Text>
                    <FlatList
                        data={albums}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.horizontalList}
                        renderItem={({ item }) => (
                            <View style={styles.albumCard}>
                                <View style={styles.albumImageWrapper}>
                                    <FlatList
                                        data={[item]}
                                        keyExtractor={(i) => i.id}
                                        renderItem={({ item: album }) => (
                                            <>
                                                <View style={styles.albumImageContainer}>
                                                    <View style={styles.albumInner}>
                                                        <Text style={styles.albumName} numberOfLines={1}>{album.name}</Text>
                                                        <Text style={styles.albumArtist} numberOfLines={1}>{album.artist} • {album.year}</Text>
                                                    </View>
                                                </View>
                                            </>
                                        )}
                                    />
                                </View>
                            </View>
                        )}
                    />
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
    hero: {
        paddingHorizontal: Spacing['2xl'],
        paddingTop: Spacing['3xl'],
        paddingBottom: Spacing['2xl'],
    },
    greeting: {
        fontSize: FontSizes['4xl'],
        fontWeight: FontWeights.bold,
        color: Colors.foreground,
    },
    subtitle: {
        fontSize: FontSizes.base,
        color: Colors.mutedForeground,
        marginTop: Spacing.xs,
    },
    section: {
        marginBottom: Spacing['3xl'],
    },
    sectionTitle: {
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.bold,
        color: Colors.foreground,
        paddingHorizontal: Spacing['2xl'],
        marginBottom: Spacing.lg,
    },
    recentGrid: {
        paddingHorizontal: Spacing.lg,
    },
    recentItem: {
        marginBottom: Spacing.xs,
    },
    horizontalList: {
        paddingHorizontal: Spacing['2xl'],
    },
    albumCard: {
        width: 150,
        marginRight: Spacing.lg,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    albumImageWrapper: {
        padding: Spacing.md,
    },
    albumImageContainer: {
        marginTop: Spacing.sm,
    },
    albumInner: {},
    albumName: {
        color: Colors.foreground,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.semibold,
    },
    albumArtist: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
});
