import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { teluguSongs, genres, artists, Song } from '../../data/mockData';
import SongCard from '../../components/SongCard';
import ArtistCard from '../../components/ArtistCard';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '../../constants/theme';
import { songAPI } from '../../services/api';
import { normalizeSongs } from '../../services/normalizeSong';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [allSongs, setAllSongs] = useState<Song[]>(teluguSongs);
    const [externalSongs, setExternalSongs] = useState<Song[]>([]);
    const [isLoadingExternal, setIsLoadingExternal] = useState(false);
    const [externalError, setExternalError] = useState<string | null>(null);

    // Cache for external search results
    const searchCacheRef = useRef<Record<string, Song[]>>({});
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch local songs on component mount
    useEffect(() => {
        const fetchLocalSongs = async () => {
            try {
                const songs = await songAPI.getAllSongs();
                const normalizedSongs = normalizeSongs(songs);
                setAllSongs(normalizedSongs);
            } catch (error) {
                console.error('Error fetching local songs:', error);
                // Fall back to mock data
                setAllSongs(teluguSongs);
            }
        };

        fetchLocalSongs();
    }, []);

    // Fetch external songs with debouncing and caching
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!query.trim()) {
            setExternalSongs([]);
            setExternalError(null);
            return;
        }

        debounceTimerRef.current = setTimeout(async () => {
            // Check cache first
            if (searchCacheRef.current[query]) {
                console.log('📦 Using cached results for:', query);
                setExternalSongs(searchCacheRef.current[query]);
                setExternalError(null);
                return;
            }

            try {
                setIsLoadingExternal(true);
                setExternalError(null);
                console.log('🔎 Starting search for:', query);

                const response = await songAPI.searchExternal(query);
                console.log('📥 API Response:', {
                  success: response.success,
                  count: response.songs?.length,
                  source: response.source,
                });

                // Normalize based on source type
                const sourceType = response.source === 'external' ? 'external' : 'local';
                const normalizedSongs = normalizeSongs(response.songs || [], sourceType);

                // Cache the results
                searchCacheRef.current[query] = normalizedSongs;
                setExternalSongs(normalizedSongs);

                // Show appropriate message
                if (!response.success) {
                    if (response.songs && response.songs.length === 0) {
                        setExternalError('No external results. Try searching in your library.');
                    } else {
                        setExternalError(response.message || 'External search unavailable');
                    }
                } else {
                    setExternalError(null);
                }
            } catch (error) {
                console.error('❌ Search error:', error);
                setExternalError('Search temporarily unavailable');
                setExternalSongs([]);
            } finally {
                setIsLoadingExternal(false);
            }
        }, 500);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [query]);

    // Filter local songs
    const filteredSongs = allSongs.filter(
        (song) =>
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase()) ||
            song.album.toLowerCase().includes(query.toLowerCase())
    );

    const filteredArtists = artists.filter((artist) =>
        artist.name.toLowerCase().includes(query.toLowerCase())
    );

    const trendingSearches = ['Srivalli', 'Sid Sriram', 'Naatu Naatu', 'Buttabomma', 'Anirudh'];
    const isSearching = query.length > 0;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={styles.heading}>Search</Text>

                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={20} color={Colors.mutedForeground} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="What do you want to listen to?"
                        placeholderTextColor={Colors.mutedForeground}
                        value={query}
                        onChangeText={setQuery}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={20} color={Colors.mutedForeground} />
                        </TouchableOpacity>
                    )}
                </View>

                {!isSearching ? (
                    <>
                        {/* Trending Searches */}
                        <View style={styles.section}>
                            <View style={styles.trendingHeader}>
                                <Ionicons name="trending-up" size={18} color={Colors.primary} />
                                <Text style={styles.sectionTitle}>Trending Searches</Text>
                            </View>
                            <View style={styles.chipsRow}>
                                {trendingSearches.map((search) => (
                                    <TouchableOpacity
                                        key={search}
                                        style={styles.chip}
                                        onPress={() => setQuery(search)}
                                    >
                                        <Text style={styles.chipText}>{search}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Browse by Genre */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Browse All</Text>
                            <View style={styles.genreGrid}>
                                {genres.map((genre) => (
                                    <TouchableOpacity key={genre.id} style={styles.genreCard} activeOpacity={0.8}>
                                        <LinearGradient
                                            colors={[...genre.colors]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.genreGradient}
                                        >
                                            <Text style={styles.genreName}>{genre.name}</Text>
                                            <Image
                                                source={{ uri: genre.image }}
                                                style={styles.genreImage}
                                            />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Popular Artists */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Popular Artists</Text>
                            <FlatList
                                data={artists}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => <ArtistCard artist={item} />}
                            />
                        </View>
                    </>
                ) : (
                    <>
                        {/* Local Library Results */}
                        {filteredSongs.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Local Library</Text>
                                <FlatList
                                    data={filteredSongs}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => <SongCard song={item} />}
                                />
                            </View>
                        )}

                        {/* Search Results — Artists */}
                        {filteredArtists.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Artists</Text>
                                <FlatList
                                    data={filteredArtists}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => <ArtistCard artist={item} />}
                                />
                            </View>
                        )}

                        {/* External Songs Results */}
                        {externalSongs.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.externalHeader}>
                                    <Ionicons name="cloud" size={18} color={Colors.primary} />
                                    <Text style={styles.sectionTitle}>Search Results</Text>
                                </View>
                                <FlatList
                                    data={externalSongs}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => <SongCard song={item} />}
                                />
                            </View>
                        )}

                        {/* Loading Indicator */}
                        {isLoadingExternal && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={Colors.primary} />
                                <Text style={styles.loadingText}>Searching...</Text>
                            </View>
                        )}

                        {/* External Error */}
                        {externalError && !isLoadingExternal && (
                            <View style={styles.errorContainer}>
                                <Ionicons name="warning" size={24} color={Colors.destructive} />
                                <Text style={styles.errorText}>{externalError}</Text>
                            </View>
                        )}

                        {/* No results */}
                        {filteredSongs.length === 0 && filteredArtists.length === 0 && externalSongs.length === 0 && !isLoadingExternal && (
                            <View style={styles.noResults}>
                                <Text style={styles.noResultsText}>No results found for "{query}"</Text>
                                <Text style={styles.noResultsHint}>Try searching for something else</Text>
                            </View>
                        )}
                    </>
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
    heading: {
        fontSize: FontSizes['3xl'],
        fontWeight: FontWeights.bold,
        color: Colors.foreground,
        textAlign: 'center',
        marginTop: Spacing['2xl'],
        marginBottom: Spacing['2xl'],
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius['2xl'],
        paddingHorizontal: Spacing.lg,
        height: 52,
        gap: Spacing.md,
        marginBottom: Spacing['3xl'],
    },
    searchInput: {
        flex: 1,
        color: Colors.foreground,
        fontSize: FontSizes.base,
    },
    section: {
        marginBottom: Spacing['3xl'],
    },
    trendingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.bold,
        color: Colors.foreground,
        marginBottom: Spacing.lg,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    chip: {
        backgroundColor: Colors.card,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    chipText: {
        color: Colors.foreground,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.medium,
    },
    genreGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    genreCard: {
        width: '48%',
        aspectRatio: 2,
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
    },
    genreGradient: {
        flex: 1,
        padding: Spacing.lg,
        position: 'relative',
        overflow: 'hidden',
    },
    genreName: {
        color: '#fff',
        fontSize: FontSizes.lg,
        fontWeight: FontWeights.bold,
    },
    genreImage: {
        position: 'absolute',
        right: -10,
        bottom: -10,
        width: 60,
        height: 60,
        borderRadius: BorderRadius.md,
        opacity: 0.7,
        transform: [{ rotate: '12deg' }],
    },
    noResults: {
        alignItems: 'center',
        paddingVertical: Spacing['5xl'],
    },
    noResultsText: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.xl,
        fontWeight: FontWeights.semibold,
    },
    noResultsHint: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.sm,
        marginTop: Spacing.sm,
    },
    externalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: Spacing['3xl'],
        gap: Spacing.md,
    },
    loadingText: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.base,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
    },
    errorText: {
        color: Colors.destructive,
        fontSize: FontSizes.sm,
        flex: 1,
    },
});
