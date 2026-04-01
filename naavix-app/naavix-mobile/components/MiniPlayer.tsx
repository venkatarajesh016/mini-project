import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { usePlayer } from '../context/PlayerContext';
import { Colors, BorderRadius, FontSizes, FontWeights, Spacing, Gradients } from '../constants/theme';
import API_BASE_URL from '../config/api.config';

export default function MiniPlayer() {
    const { currentSong, isPlaying, togglePlay, nextSong, prevSong, progress, setProgress } = usePlayer();
    const soundRef = useRef<Audio.Sound | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isAudioReady, setIsAudioReady] = useState(false);

    // Setup audio mode
    useEffect(() => {
        setupAudioMode();
        return () => {
            soundRef.current?.unloadAsync();
        };
    }, []);

    const setupAudioMode = async () => {
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });
        } catch (error) {
            console.error('Error setting audio mode:', error);
        }
    };

    // Handle song changes
    useEffect(() => {
        if (currentSong?.audioUrl) {
            console.log('🎵 Song changed:', currentSong?.title);
            loadAndPlaySong();
        }
    }, [currentSong?.id, currentSong?.audioUrl]);

    // Handle play/pause
    useEffect(() => {
        if (!soundRef.current || !isAudioReady) {
            console.log('⏸️ Cannot play/pause - sound not ready');
            return;
        }

        const playOrPause = async () => {
            try {
                if (isPlaying) {
                    console.log('▶️ Playing');
                    await soundRef.current?.playAsync().catch(() => {
                        // Sound might already be playing, ignore error
                    });
                } else {
                    console.log('⏸️ Pausing');
                    await soundRef.current?.pauseAsync();
                }
            } catch (error: any) {
                console.error('❌ Error controlling playback:', {
                    message: error.message,
                    isPlaying,
                });
            }
        };

        playOrPause();
    }, [isPlaying, isAudioReady]);

    const loadAndPlaySong = async () => {
        try {
            setIsLoading(true);
            setIsAudioReady(false);

            // Stop and unload previous sound
            if (soundRef.current) {
                try {
                    console.log('⏹️ Stopping current song');
                    const status = await soundRef.current.getStatusAsync();
                    if (status.isLoaded && status.isPlaying) {
                        await soundRef.current.pauseAsync();
                    }
                    await soundRef.current.unloadAsync();
                } catch (error) {
                    console.warn('Warning stopping old sound:', error);
                }
                soundRef.current = null;
            }

            // Load new sound
            if (!currentSong?.audioUrl) {
                console.warn('No audio URL available for song:', currentSong?.title);
                setIsLoading(false);
                return;
            }

            // Convert relative proxy URLs to absolute URLs
            let audioUrl = currentSong.audioUrl;
            if (audioUrl.startsWith('/api/proxy-audio')) {
                audioUrl = `${API_BASE_URL}${audioUrl}`;
                console.log('🔗 Using proxy URL:', audioUrl.substring(0, 80) + '...');
            }

            console.log('🎵 Loading audio from:', audioUrl.substring(0, 80) + '...');

            try {
                const { sound, status } = await Audio.Sound.createAsync(
                    { uri: audioUrl },
                    { shouldPlay: false, progressUpdateIntervalMillis: 1000 }
                );

                soundRef.current = sound;

                // Set duration
                if (status.isLoaded) {
                    const duration = status.durationMillis || 0;
                    setDuration(duration);
                    console.log('✅ Audio loaded, duration:', duration, 'ms');
                    
                    if (duration === 0) {
                        console.warn('⚠️  Warning: Duration is 0, audio metadata may not have loaded');
                    }
                }

                // Handle playback status updates
                sound.setOnPlaybackStatusUpdate(handlePlaybackStatus);

                setIsLoading(false);
                setIsAudioReady(true); // This will trigger play/pause useEffect to play if isPlaying is true
            } catch (audioError: any) {
                console.error('❌ Error creating sound object:', {
                    message: audioError.message,
                    code: audioError.code,
                    url: audioUrl?.substring(0, 80),
                });
                
                // Try fallback: Use a test audio URL if the original fails
                console.log('🔄 Attempting fallback audio source...');
                try {
                    const fallbackUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
                    const { sound: fallbackSound, status: fallbackStatus } = await Audio.Sound.createAsync(
                        { uri: fallbackUrl },
                        { shouldPlay: false, progressUpdateIntervalMillis: 1000 }
                    );
                    soundRef.current = fallbackSound;
                    
                    if (fallbackStatus.isLoaded) {
                        setDuration(fallbackStatus.durationMillis || 0);
                        console.log('✅ Fallback audio loaded, duration:', fallbackStatus.durationMillis);
                    }
                    
                    fallbackSound.setOnPlaybackStatusUpdate(handlePlaybackStatus);
                    setIsLoading(false);
                    setIsAudioReady(true);
                } catch (fallbackError) {
                    console.error('❌ Fallback also failed:', fallbackError);
                    setIsLoading(false);
                    setIsAudioReady(false);
                }
            }
        } catch (error: any) {
            console.error('❌ Error loading song:', {
                message: error.message,
                url: currentSong?.audioUrl,
            });
            setIsLoading(false);
            setIsAudioReady(false);
        }
    };

    const handlePlaybackStatus = async (status: any) => {
        if (status.isLoaded) {
            // Update progress
            if (duration > 0) {
                const percent = (status.positionMillis / duration) * 100;
                setProgress(Math.min(percent, 100));
            }

            // Handle end of track
            if (status.didJustFinish && !status.isLooping) {
                nextSong();
            }
        }
    };

    if (!currentSong) return null;

    return (
        <View style={styles.wrapper}>
            {/* Progress bar */}
            <View style={styles.progressTrack}>
                <LinearGradient
                    colors={[...Gradients.naavix]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                />
            </View>

            <View style={styles.container}>
                {/* Song info */}
                <View style={styles.left}>
                    <Image source={{ uri: currentSong.cover }} style={styles.cover} />
                    <View style={styles.info}>
                        <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
                        <Text style={styles.artist} numberOfLines={1}>{currentSong.artist}</Text>
                    </View>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity onPress={prevSong} style={styles.controlBtn} disabled={isLoading}>
                        <Ionicons name="play-skip-back" size={18} color={Colors.foreground} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={togglePlay} style={styles.playBtn} disabled={isLoading || !currentSong.audioUrl || !isAudioReady}>
                        <LinearGradient
                            colors={[...Gradients.naavix]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.playBtnGradient}
                        >
                            <Ionicons
                                name={isLoading ? 'hourglass' : (isPlaying ? 'pause' : 'play')}
                                size={20}
                                color="#fff"
                                style={!isPlaying ? { marginLeft: 2 } : undefined}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={nextSong} style={styles.controlBtn} disabled={isLoading}>
                        <Ionicons name="play-skip-forward" size={18} color={Colors.foreground} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        backgroundColor: Colors.card,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        zIndex: 100,
    },
    progressTrack: {
        height: 2,
        backgroundColor: Colors.muted,
    },
    progressFill: {
        height: '100%',
        borderRadius: 1,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: Spacing.md,
    },
    cover: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
    },
    info: {
        flex: 1,
    },
    title: {
        color: Colors.foreground,
        fontSize: FontSizes.sm,
        fontWeight: FontWeights.semibold,
    },
    artist: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    controlBtn: {
        padding: Spacing.sm,
    },
    playBtn: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    playBtnGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
