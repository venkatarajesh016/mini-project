import axios from 'axios';
import API_BASE_URL from '../config/api.config';

/**
 * API Service for communicating with backend
 * Uses environment-aware configuration from config/api.config
 */

// Create axios instance with custom config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for search
});

/**
 * Song API endpoints
 */
export const songAPI = {
  // Get all local songs from database
  getAllSongs: async () => {
    try {
      const response = await apiClient.get('/getSongs');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching local songs:', error);
      throw error;
    }
  },

  // Get top songs from database
  getTopSongs: async (limit: number = 6) => {
    try {
      console.log(`🔝 Fetching top ${limit} songs from database`);
      const response = await apiClient.get('/getTopSongs', {
        params: { limit },
      });
      
      console.log(`✅ Fetched ${response.data?.count || 0} top songs`);
      
      return {
        success: response.data?.success || true,
        songs: response.data?.songs || [],
        count: response.data?.count || 0,
        source: response.data?.source || 'local',
      };
    } catch (error: any) {
      console.error('❌ Error fetching top songs:', error?.message);
      
      return {
        success: false,
        songs: [],
        count: 0,
        message: 'Failed to fetch top songs',
        source: 'error',
      };
    }
  },

  // Get trending Telugu songs from external API
  getTrendingTeluguSongs: async () => {
    try {
      console.log(`🔝 Fetching trending Telugu songs from external API`);
      // Use search queries that target recently released and trending content
      const trendingQueries = [
        'telugu new songs 2025',      // Recently released
        'telugu trending 2024',        // Currently trending
        'telugu blockbuster songs',    // Popular famous songs
        'telugu viral songs',          // Viral/trending content
      ];

      for (const query of trendingQueries) {
        try {
          const response = await apiClient.get(`/external-songs?q=${encodeURIComponent(query)}`, {
            timeout: 10000,
          });
          
          if (response.data?.success && response.data?.songs && response.data.songs.length > 0) {
            console.log(`✅ Fetched ${response.data.count} songs for: "${query}"`);
            return {
              success: response.data.success || false,
              songs: response.data.songs.slice(0, 6) || [], // Get top 6
              count: Math.min(6, response.data.count || 0),
              source: response.data.source || 'external',
              query: query,
            };
          }
        } catch (err) {
          console.log(`⚠️ Trying next query...`);
          continue;
        }
      }

      // Fallback if all queries fail
      return {
        success: false,
        songs: [],
        count: 0,
        source: 'external',
      };
    } catch (error: any) {
      console.error(`API Error: `, error.message);
      return {
        success: false,
        songs: [],
        count: 0,
        source: 'external',
        error: error.message,
      };
    }
  },

  // Search external API (JioSaavn) with better error handling
  searchExternal: async (query: string) => {
    try {
      if (!query.trim()) {
        throw new Error('Search query cannot be empty');
      }

      console.log(`🔍 Searching for: "${query}"`);
      const response = await apiClient.get('/external-songs', {
        params: { q: query },
        timeout: 8000, // 8 second timeout for search
      });

      console.log(`✅ Search response received, found ${response.data?.count || 0} songs`);
      
      return {
        success: response.data?.success || false,
        songs: response.data?.songs || [],
        message: response.data?.message || '',
        source: response.data?.source || 'unknown',
      };
    } catch (error: any) {
      const errorDetails = {
        message: error?.message || 'Unknown error',
        code: error?.code,
        status: error?.response?.status,
        url: error?.config?.url,
      };
      
      console.error('❌ Error searching external songs:', errorDetails);
      
      // Return a safe response instead of throwing
      // This allows the UI to handle the error gracefully
      return {
        success: false,
        songs: [],
        message: 'External search unavailable, try searching your library',
        source: 'error',
      };
    }
  },

  // Get songs by album
  getSongsByAlbum: async (albumId: string) => {
    try {
      const response = await apiClient.get(`/getSongsByAlbum/${albumId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching songs by album:', error);
      throw error;
    }
  },

  // Add new song (admin function)
  addSong: async (formData: FormData) => {
    try {
      const response = await apiClient.post('/addSong', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error adding song:', error);
      throw error;
    }
  },

  // Delete song
  deleteSong: async (songId: string) => {
    try {
      const response = await apiClient.delete(`/deleteSong/${songId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting song:', error);
      throw error;
    }
  },
};

/**
 * Album API endpoints
 */
export const albumAPI = {
  // Get all albums
  getAllAlbums: async () => {
    try {
      const response = await apiClient.get('/getAllAlbums');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching albums:', error);
      throw error;
    }
  },

  // Get album by ID
  getAlbumById: async (albumId: string) => {
    try {
      const response = await apiClient.get(`/getAlbumById/${albumId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching album:', error);
      throw error;
    }
  },

  // Add new album (admin function)
  addAlbum: async (formData: FormData) => {
    try {
      const response = await apiClient.post('/addNewAlbum', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error adding album:', error);
      throw error;
    }
  },

  // Delete album
  deleteAlbum: async (albumId: string) => {
    try {
      const response = await apiClient.delete(`/deleteAlbum/${albumId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting album:', error);
      throw error;
    }
  },
};

/**
 * Utility functions
 */

// Change API base URL (useful if backend URL changes)
export const setAPIBaseURL = (url: string) => {
  apiClient.defaults.baseURL = url;
};

// Get current API base URL
export const getAPIBaseURL = () => {
  return apiClient.defaults.baseURL;
};

export default apiClient;
