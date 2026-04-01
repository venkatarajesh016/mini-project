/**
 * Player Context with Queue Management
 * Handles song playback, queue management, and autoplay with recommendations
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  // Playback state
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Queue management
  const [queue, setQueue] = useState([]); // Array of song objects
  const [queueIndex, setQueueIndex] = useState(0);
  const [history, setHistory] = useState([]); // Previously played songs

  // Recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Volume control
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Refs
  const audioRef = useRef(null);
  const recommendationTimeoutRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  /**
   * Fetch recommendations from backend
   */
  const fetchRecommendations = useCallback(async (songId) => {
    if (!songId) return;

    setIsLoadingRecommendations(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/recommend/${songId}`,
        { timeout: 30000 }
      );

      if (response.data.status === 'success') {
        const recs = response.data.data.recommendations;
        setRecommendations(recs);
        console.log(`✅ Fetched ${recs.length} recommendations`);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error.message);
      setRecommendations([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [API_BASE_URL]);

  /**
   * Append recommendations to queue
   * Called when a song starts playing or when song ends without user interaction
   */
  const appendRecommendationsToQueue = useCallback((recs) => {
    if (!recs || recs.length === 0) return;

    setQueue(prevQueue => {
      // Get current position in queue
      const currentLength = prevQueue.length;

      // Transform recommendations to song objects
      const recSongs = recs.map((rec, idx) => ({
        _id: rec._id || rec.id,
        title: rec.title,
        artist: rec.artist,
        genre: rec.genre,
        album: rec.album,
        singer: rec.singer,
        image: rec.image || '',
        url: rec.url || '',
        reason: rec.recommendation_reason,
        isRecommendation: true,
        index: currentLength + idx
      }));

      return [...prevQueue, ...recSongs];
    });

    console.log(`📋 Added ${recs.length} recommendations to queue`);
  }, []);

  /**
   * Play a song
   */
  const playSong = useCallback(
    (song, songIndex = null) => {
      if (!song) return;

      setCurrentSong(song);
      setQueueIndex(songIndex !== null ? songIndex : 0);
      setIsPlaying(true);
      setCurrentTime(0);

      // Fetch recommendations when song starts
      if (song._id && autoplayEnabled) {
        fetchRecommendations(song._id);
      }

      console.log(`🎵 Now playing: ${song.title} by ${song.artist}`);
    },
    [autoplayEnabled, fetchRecommendations]
  );

  /**
   * Play next song in queue
   */
  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;

    // If we're at end of queue and autoplay is enabled, add recommendations
    if (nextIndex >= queue.length) {
      if (autoplayEnabled && recommendations.length > 0) {
        appendRecommendationsToQueue(recommendations);
        // After appending, the queue will be longer
        nextIndex = queueIndex + 1;
      } else {
        // End of queue reached
        setIsPlaying(false);
        console.log('🏁 End of queue');
        return;
      }
    }

    const nextSong = queue[nextIndex];
    if (nextSong) {
      // Add current song to history
      if (currentSong) {
        setHistory(prev => [...prev, currentSong]);
      }

      playSong(nextSong, nextIndex);
    }
  }, [queue, queueIndex, currentSong, autoplayEnabled, recommendations, playSong, appendRecommendationsToQueue]);

  /**
   * Play previous song
   */
  const playPrevious = useCallback(() => {
    if (history.length === 0) {
      // Can't go back, restart current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const prevSong = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    // Add current song back to queue beginning
    if (currentSong) {
      setQueue(prev => [currentSong, ...prev]);
    }

    setHistory(newHistory);
    playSong(prevSong, 0);
  }, [history, currentSong, playSong]);

  /**
   * Add song to queue
   */
  const addToQueue = useCallback((song) => {
    setQueue(prev => [...prev, song]);
    console.log(`✅ Added "${song.title}" to queue`);
  }, []);

  /**
   * Add multiple songs to queue
   */
  const addMultipleToQueue = useCallback((songs) => {
    if (!Array.isArray(songs)) return;
    setQueue(prev => [...prev, ...songs]);
    console.log(`✅ Added ${songs.length} songs to queue`);
  }, []);

  /**
   * Remove song from queue by index
   */
  const removeFromQueue = useCallback((index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    console.log(`🗑️ Removed song at index ${index}`);
  }, []);

  /**
   * Clear queue
   */
  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(0);
    console.log('🧹 Queue cleared');
  }, []);

  /**
   * Move song in queue
   */
  const moveInQueue = useCallback((fromIndex, toIndex) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const [song] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, song);
      return newQueue;
    });
  }, []);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  }, [isPlaying]);

  /**
   * Seek to time
   */
  const seek = useCallback((time) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  /**
   * Update volume
   */
  const setVolumeLevel = useCallback((level) => {
    setVolume(level);
    if (audioRef.current) {
      audioRef.current.volume = level;
    }
  }, []);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  /**
   * Handle when song ends
   */
  const handleSongEnd = useCallback(() => {
    console.log('⏹️ Song ended');
    if (autoplayEnabled) {
      // Automatically play next song
      playNext();
    } else {
      setIsPlaying(false);
    }
  }, [autoplayEnabled, playNext]);

  /**
   * Handle time update
   */
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  }, []);

  /**
   * Initialize queue with songs
   */
  const initializeQueue = useCallback((songs, startIndex = 0) => {
    setQueue(songs);
    if (songs.length > 0) {
      playSong(songs[startIndex], startIndex);
    }
  }, [playSong]);

  // Effect: Auto-play next song when current ends
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.addEventListener('ended', handleSongEnd);

    return () => {
      audio.removeEventListener('ended', handleSongEnd);
    };
  }, [handleSongEnd]);

  // Effect: Auto-play next song when duration is reached
  useEffect(() => {
    if (!isPlaying || !audioRef.current) return;

    const audio = audioRef.current;
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isPlaying, handleTimeUpdate]);

  // Provider value
  const value = {
    // Playback state
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,

    // Queue
    queue,
    queueIndex,
    history,

    // Recommendations
    recommendations,
    autoplayEnabled,
    isLoadingRecommendations,

    // Playback controls
    playSong,
    playNext,
    playPrevious,
    togglePlayPause,
    seek,
    setVolumeLevel,
    toggleMute,

    // Queue management
    addToQueue,
    addMultipleToQueue,
    removeFromQueue,
    clearQueue,
    moveInQueue,
    initializeQueue,

    // Recommendations
    fetchRecommendations,
    appendRecommendationsToQueue,
    setAutoplayEnabled,

    // Refs
    audioRef
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;
