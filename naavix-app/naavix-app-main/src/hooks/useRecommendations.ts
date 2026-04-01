import { useState, useCallback } from 'react';

export interface RecommendedSong {
  id: string;
  title: string;
  singer: string;
  artist: string;
  genre: string;
  album: string;
  year: number;
  recommendation_reason: string;
  similarity_score: number;
}

interface FetchRecommendationsParams {
  song_id?: string;
  title?: string;
  artist?: string;
  top_k?: number;
}

const API_BASE_URL = 'http://localhost:8000';

/**
 * Custom hook for fetching music recommendations from the ML service API
 * @returns Object with recommendations state and fetch function
 */
export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<RecommendedSong[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (params: FetchRecommendationsParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          song_id: params.song_id,
          title: params.title,
          artist: params.artist,
          top_k: params.top_k || 8,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      return data.recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recommendations';
      setError(errorMessage);
      console.error('Recommendation API error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setError(null);
  }, []);

  return {
    recommendations,
    isLoading,
    error,
    fetchRecommendations,
    clearRecommendations,
  };
};
