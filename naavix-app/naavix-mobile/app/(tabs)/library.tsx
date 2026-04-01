import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { playlists, albums, artists, Album } from '../../data/mockData';
import PlaylistCard from '../../components/PlaylistCard';
import ArtistCard from '../../components/ArtistCard';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius, Gradients } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { albumAPI } from '../../services/api';

type TabType = 'playlists' | 'albums' | 'artists';

export default function LibraryScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('playlists');
    const [loadedAlbums, setLoadedAlbums] = useState<Album[]>(albums);
    const router = useRouter();

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            const fetchedAlbums = await albumAPI.getAllAlbums();
            if (fetchedAlbums && fetchedAlbums.length > 0) {
                setLoadedAlbums(fetchedAlbums);
            } else {
                setLoadedAlbums(albums);
            }
        } catch (error) {
            console.error('Error fetching albums:', error);
            // Fall back to mock data
            setLoadedAlbums(albums);
        }
    };

    const tabs: { key: TabType; label: string }[] = [
        { key: 'playlists', label: 'Playlists' },
        { key: 'albums', label: 'Albums' },
        { key: 'artists', label: 'Artists' },
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.heading}>Your Library</Text>
                </View>

                {/* Tab Bar */}
                <View style={styles.tabBar}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            style={styles.tabButton}
                        >
                            {activeTab === tab.key ? (
                                <LinearGradient
                                    colors={[...Gradients.naavix]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.tabGradient}
                                >
                                    <Text style={styles.tabTextActive}>{tab.label}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.tabInactive}>
                                    <Text style={styles.tabTextInactive}>{tab.label}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Playlists Tab */}
                {activeTab === 'playlists' && (
                    <View style={styles.gridContainer}>
                        {playlists.map((playlist) => (
                            <TouchableOpacity
                                key={playlist.id}
                                style={styles.gridItem}
                                onPress={() => router.push(`/playlist/${playlist.id}`)}
                                activeOpacity={0.8}
                            >
                                <Image source={{ uri: playlist.cover }} style={styles.gridImage} />
                                <Text style={styles.gridTitle} numberOfLines={1}>{playlist.name}</Text>
                                <Text style={styles.gridSubtitle} numberOfLines={1}>
                                    {playlist.songCount} songs
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Albums Tab */}
                {activeTab === 'albums' && (
                    <View style={styles.gridContainer}>
                        {loadedAlbums.map((album) => (
                            <View key={album.id} style={styles.gridItem}>
                                <Image source={{ uri: album.cover }} style={styles.gridImage} />
                                <Text style={styles.gridTitle} numberOfLines={1}>{album.name}</Text>
                                <Text style={styles.gridSubtitle} numberOfLines={1}>
                                    {album.artist} • {album.year}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Artists Tab */}
                {activeTab === 'artists' && (
                    <View style={styles.artistGrid}>
                        {artists.map((artist) => (
                            <View key={artist.id} style={styles.artistItem}>
                                <ArtistCard artist={artist} />
                            </View>
                        ))}
                    </View>
                )}

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
        paddingHorizontal: Spacing['2xl'],
    },
    header: {
        marginTop: Spacing['2xl'],
        marginBottom: Spacing['2xl'],
    },
    heading: {
        fontSize: FontSizes['3xl'],
        fontWeight: FontWeights.bold,
        color: Colors.foreground,
    },
    tabBar: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing['2xl'],
    },
    tabButton: {
        flex: 1,
    },
    tabGradient: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    tabInactive: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tabTextActive: {
        color: '#fff',
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.semibold,
    },
    tabTextInactive: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.medium,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.lg,
    },
    gridItem: {
        width: '47%',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
    },
    gridImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
    },
    gridTitle: {
        color: Colors.foreground,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.semibold,
    },
    gridSubtitle: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
    artistGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    artistItem: {
        width: '33%',
        marginBottom: Spacing['2xl'],
    },
});
