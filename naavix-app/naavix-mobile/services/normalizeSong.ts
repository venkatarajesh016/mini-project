/**
 * Normalize songs from different sources (local DB and external API)
 * Ensures consistent format for all songs
 */

import { Song } from '../data/mockData';
import API_BASE_URL from '../config/api.config';

/**
 * Normalize a song to ensure it has all required fields
 * Supports both local database songs and external API songs
 */
export const normalizeSong = (song: any, sourceType: string = 'local'): Song => {
  if (sourceType === 'external') {
    // Normalize external API songs (from JioSaavn)
    // The backend already normalizes these, so prioritize audioUrl if it exists
    return {
      id: song.id || song._id || generateId(),
      title: song.name || song.title || 'Unknown Song',
      artist: song.primaryArtists || song.artist || 'Unknown Artist',
      album: song.album || song.album_name || 'Unknown Album',
      duration: formatDuration(song.duration || song.durationms),
      cover: song.image?.[2]?.url || song.image || song.ImageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      isLiked: false,
      // Use audioUrl if already set by backend, otherwise extract from downloadUrl
      audioUrl: song.audioUrl || song.downloadUrl?.[4]?.url || song.downloadUrl?.[3]?.url,
    };
  }

  // Local database songs (default)
  const normalizedSong: Song = {
    id: song.id || song._id || generateId(),
    title: song.title || song.name || 'Unknown Song',
    artist: song.artist || song.artists?.[0]?.name || 'Unknown Artist',
    album: song.album || song.album_name || 'Unknown Album',
    duration: formatDuration(song.duration),
    cover: song.cover || song.ImageUrl || song.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    isLiked: song.isLiked || false,
    audioUrl: song.audioUrl || (song.FileUrl ? `${API_BASE_URL}/${song.FileUrl}` : undefined),
  };

  return normalizedSong;
};

/**
 * Normalize multiple songs
 */
export const normalizeSongs = (songs: any[], sourceType: string = 'local'): Song[] => {
  return songs.map(song => normalizeSong(song, sourceType));
};

/**
 * Format duration to MM:SS format
 */
export const formatDuration = (duration: any): string => {
  if (!duration) return '0:00';

  // If it's a string in MM:SS format, return as is
  if (typeof duration === 'string' && duration.includes(':')) {
    return duration;
  }

  // If it's a number (seconds), convert to MM:SS
  if (typeof duration === 'number') {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return '0:00';
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate songs - check if they have required fields for playing
 */
export const validateSongs = (songs: any[]): Song[] => {
  return songs
    .map(song => normalizeSong(song))
    .filter(song => song.title && song.artist);
};

export default normalizeSong;
