import { useState, useEffect } from 'react';

const CACHE_KEY = 'home_data_cache';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export const useHomeData = () => {
  const [data, setData] = useState({ playlists: [], albums: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setData(cachedData);
            setLoading(false);
            setError(null);
            return;
          }
        }

        const response = await fetch('http://localhost:3000/api/home');
        if (!response.ok) throw new Error('Failed to fetch home data');

        const result = await response.json();
        const homeData = result.data || result;
        setData(homeData);

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: homeData,
            timestamp: Date.now(),
          })
        );

        setError(null);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const clearHomeDataCache = () => {
  localStorage.removeItem(CACHE_KEY);
};
