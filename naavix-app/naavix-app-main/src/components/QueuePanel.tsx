import React, { useState, useEffect } from 'react';
import { X, Play, Trash2, Plus, Loader, AlertCircle, Zap, Wifi, WifiOff } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { Song } from '@/data/mockData';

interface RecommendedSong {
  id: string;
  title: string;
  singer: string;
  artist: string;
  genre: string;
  album: string;
  year: number;
  recommendation_reason: string;
  similarity_score: number;
  image?: string; // ← Image URL from ML model
  cover?: string;
  url?: string; // JioSaavn URL from API
  FileUrl?: string; // Backend audio file URL (enriched during fetch)
  ImageUrl?: string; // Backend image URL (enriched during fetch)
  _id?: string; // MongoDB ID (enriched during fetch)
}

const ML_SERVICE_URL = 'http://localhost:8000'; // ML recommendations service
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'; // Main backend

// Placeholder image
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200?text=Album+Art';

// Normalize image URLs from backend ImageUrl field
const normalizeImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return PLACEHOLDER_IMAGE;
  
  // Validate it's a string
  imageUrl = String(imageUrl).trim();
  
  // If invalid values, return placeholder
  if (!imageUrl || imageUrl === 'nan' || imageUrl === 'NaN' || imageUrl === 'undefined' || imageUrl === 'null') {
    return PLACEHOLDER_IMAGE;
  }
  
  // If already a full URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a placeholder URL already, return as-is
  if (imageUrl.includes('placeholder.com') || imageUrl.includes('via.placeholder')) {
    return imageUrl;
  }
  
  // If it looks like a query string (has ? without http), it's malformed
  if (imageUrl.includes('?') && !imageUrl.includes('http')) {
    console.warn('⚠️ Malformed image URL (looks like query string):', imageUrl);
    return PLACEHOLDER_IMAGE;
  }
  
  // Replace Windows backslashes with forward slashes
  let normalizedUrl = imageUrl.replace(/\\/g, '/');
  
  // Remove "uploads/" prefix if it exists (case-insensitive)
  normalizedUrl = normalizedUrl.replace(/^uploads\//i, '');
  
  // Remove any leading slashes
  normalizedUrl = normalizedUrl.replace(/^\/+/, '');
  
  // URL-encode the path to handle spaces and special characters
  const encodedUrl = normalizedUrl
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
  return `${backendUrl}/uploads/${encodedUrl}`;
};

const QueuePanel: React.FC = () => {
  const { queue, isQueueOpen, toggleQueue, playSong, removeFromQueue, currentSong, addToQueue } = usePlayer();
  const [recommendations, setRecommendations] = useState<RecommendedSong[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedReason, setExpandedReason] = useState<string | null>(null);
  const [mlServiceAvailable, setMlServiceAvailable] = useState(true);

  // Check if ML service is available (optional - doesn't block main app)
  useEffect(() => {
    const checkMLService = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        const fetchPromise = fetch(`${ML_SERVICE_URL}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        setMlServiceAvailable((response as Response).ok);
      } catch (err) {
        console.warn('⚠️ ML service unavailable (optional)');
        setMlServiceAvailable(false);
      }
    };

    checkMLService();
    const interval = setInterval(checkMLService, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recommendations when current song changes
  useEffect(() => {
    if (currentSong && isQueueOpen && mlServiceAvailable) {
      fetchRecommendations();
    }
  }, [currentSong?.id, isQueueOpen, mlServiceAvailable]);

  // Fetch full song details from API for queue songs
  const enrichQueueSongsWithBackendData = async () => {
    if (queue.length === 0) return;

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
      console.log(`🔍 enrichQueueSongsWithBackendData: backendUrl = ${backendUrl}`);
      
      // Fetch all songs from backend
      const fetchUrl = `${backendUrl}/getSongs`;
      console.log(`📡 Fetching: ${fetchUrl}`);
      const response = await fetch(fetchUrl);
      console.log(`✅ Response status: ${response.status}`);
      const data = await response.json();
      
      // Response can be either array directly or wrapped in object
      const allSongs = Array.isArray(data) ? data : data.songs || data.data || [];
      
      console.log('📥 Fetched', allSongs.length, 'songs from backend API');
      
      // For each queue song, find matching backend song and extract FileUrl + ImageUrl
      const enrichedQueue = queue.map((queueSong) => {
        // Try to find matching song in backend by title or ID
        const backendSong = allSongs.find((backendSong: any) => 
          (queueSong.id && (backendSong._id?.toString() === queueSong.id || backendSong.id?.toString() === queueSong.id)) ||
          queueSong.title?.toLowerCase() === backendSong.title?.toLowerCase() ||
          (queueSong.title && backendSong.title?.toLowerCase().includes(queueSong.title.toLowerCase()))
        );

        if (backendSong) {
          console.log(`✅ Found backend data for: ${queueSong.title}`, backendSong);
          return {
            ...queueSong,
            FileUrl: backendSong.FileUrl || queueSong.FileUrl,
            ImageUrl: backendSong.ImageUrl || queueSong.ImageUrl, // ← Store database ImageUrl
            cover: normalizeImageUrl(backendSong.ImageUrl) || queueSong.cover, // ← Display normalized URL
            genre: backendSong.genre || queueSong.genre,
            album: backendSong.album || queueSong.album,
            _id: backendSong._id || queueSong._id,
          };
        } else {
          console.log(`⚠️ No backend match found for: ${queueSong.title}`);
          return queueSong;
        }
      });

      console.log('🔄 Queue enrichment complete:', enrichedQueue);
      return enrichedQueue;
    } catch (err) {
      console.error('❌ Error enriching queue songs:', err);
      return queue;
    }
  };

  // Fetch queue songs from API when queue panel opens or queue changes
  useEffect(() => {
    if (isQueueOpen && queue.length > 0) {
      enrichQueueSongsWithBackendData();
    }
  }, [isQueueOpen, queue.length]);;

  const fetchRecommendations = async () => {
    if (!currentSong || !mlServiceAvailable) return;

    setIsLoadingRecs(true);
    setError(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
      console.log(`🔍 fetchRecommendations: ML_SERVICE_URL = ${ML_SERVICE_URL}`);
      console.log(`🔍 fetchRecommendations: backendUrl = ${backendUrl}`);

      // Step 1: Fetch recommendations from ML service
      const recUrl = `${ML_SERVICE_URL}/recommend`;
      console.log(`📡 Fetching recommendations: ${recUrl}`);
      const recResponse = await fetch(recUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: currentSong.title,
          artist: currentSong.artist,
          top_k: 8,
        }),
      });

      if (!recResponse.ok) {
        throw new Error(`ML API error: ${recResponse.status}`);
      }

      const recData = await recResponse.json();
      let mlRecommendations = recData.recommendations || [];
      console.log('🤖 ML Recommendations (from ML model):', mlRecommendations);

      // Step 2: Fetch all songs from backend to enrich recommendations with FileUrl
      let enrichedRecommendations = mlRecommendations;
      try {
        const getSongsUrl = `${backendUrl}/getSongs`;
        console.log(`📡 Fetching backend songs: ${getSongsUrl}`);
        const songResponse = await fetch(getSongsUrl);
        console.log(`✅ Backend response status: ${songResponse.status}`);
        const songData = await songResponse.json();
        const allBackendSongs = Array.isArray(songData) ? songData : songData.songs || songData.data || [];
        
        console.log('📚 Backend songs fetched:', allBackendSongs.length);

        // Enrich recommendations with backend data (FileUrl, ImageUrl, etc)
        enrichedRecommendations = mlRecommendations.map((recSong: any) => {
          // Try to match with backend song by title, artist, or ID
          const backendSong = allBackendSongs.find((backendSong: any) => {
            // Title matching: exact or partial match
            const titleMatch = 
              recSong.title?.toLowerCase() === backendSong.title?.toLowerCase() ||
              recSong.title?.toLowerCase().includes(backendSong.title?.toLowerCase()?.substring(0, 20)) ||
              backendSong.title?.toLowerCase().includes(recSong.title?.toLowerCase()?.substring(0, 20));
            
            if (!titleMatch) return false;
            
            // Artist matching: be lenient with "Unknown"
            const recArtist = recSong.artist?.toLowerCase().trim() || '';
            const backendArtist = backendSong.artist?.toLowerCase().trim() || '';
            
            const artistMatch = 
              recArtist === 'unknown' || // From ML service
              backendArtist === 'unknown' || // From backend
              recArtist === '' || 
              backendArtist === '' ||
              recArtist.includes(backendArtist.substring(0, 15)) ||
              backendArtist.includes(recArtist.substring(0, 15));
            
            return titleMatch && artistMatch;
          });

          if (backendSong) {
            console.log(`✅ Enriched: "${recSong.title}" (${recSong.artist}) → FileUrl: ${backendSong.FileUrl}, ImageUrl: ${backendSong.ImageUrl}`);
            return {
              ...recSong,
              FileUrl: backendSong.FileUrl,
              ImageUrl: backendSong.ImageUrl, // ← Store database ImageUrl
              // Use ML model image first, then backend, then current song
              cover: normalizeImageUrl(recSong.image) || normalizeImageUrl(backendSong.ImageUrl) || normalizeImageUrl(currentSong.ImageUrl),
              genre: backendSong.genre || recSong.genre,
              album: backendSong.album || recSong.album,
              _id: backendSong._id,
            };
          } else {
            console.log(
              `⚠️ No backend match for: "${recSong.title}" (${recSong.artist}) - checking if song has external URL`
            );
            // If no backend match, still try to use a dataset image if available
            return {
              ...recSong,
              ImageUrl: currentSong.ImageUrl, // ← Use current song's dataset image
              // Use ML model image first, then current song's dataset image
              cover: normalizeImageUrl(recSong.image) || normalizeImageUrl(currentSong.ImageUrl) || PLACEHOLDER_IMAGE,
              FileUrl: '', // Explicitly empty - will use audioUrl if available
            };
          }
        });
      } catch (backendErr) {
        console.warn('⚠️ Could not fetch backend songs for enrichment:', backendErr);
        // Continue with just ML recommendations if backend fetch fails
        // Still try to use ML model images and dataset images from current song
        enrichedRecommendations = mlRecommendations.map((song: any) => ({
          ...song,
          ImageUrl: currentSong.ImageUrl, // ← Store dataset image from current song
          // Use ML model image first, then dataset image
          cover: normalizeImageUrl(song.image) || normalizeImageUrl(currentSong.ImageUrl) || PLACEHOLDER_IMAGE,
        }));
      }

      setRecommendations(enrichedRecommendations);
      
      // Debug output showing enrichment status
      const enrichmentSummary = enrichedRecommendations.map((rec: any) => ({
        title: rec.title,
        enriched: !!rec.FileUrl,
        FileUrl: rec.FileUrl || 'MISSING',
        ModelImage: rec.image ? '✓' : '✗',
        DBImage: rec.ImageUrl ? '✓' : '✗',
        hasExternalUrl: !!rec.url,
      }));
      console.table(enrichmentSummary);
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Failed to fetch recommendations');
      setRecommendations([]);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handlePlayRecommendation = async (song: RecommendedSong) => {
    try {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`▶️  PLAY RECOMMENDATION: ${song.title}`);
      console.log(`${'='.repeat(80)}`);
      
      let finalSong = { ...song };
      const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';

      // DEBUG: Log all URL fields in the song object
      console.log(`\n📋 SONG DETAILS:`, {
        title: song.title,
        artist: song.artist,
        url: song.url?.substring(0, 100),
        FileUrl: song.FileUrl?.substring(0, 100),
        audioUrl: (song as any).audioUrl?.substring(0, 100),
        image: song.image?.substring(0, 100),
        cover: (song as any).cover?.substring(0, 100),
      });

      // STEP 1: Detect and handle JioSaavn URLs
      const urlsToCheck = [
        song.url,
        (song as any).audioUrl,
      ].filter(Boolean);
      
      let jiosaavnUrl: string | null = null;
      for (const url of urlsToCheck) {
        if (url && (url.includes('jiosaavn.com') || url.includes('/song/'))) {
          console.log(`✅ DETECTED JIOSAAVN URL: ${url.substring(0, 100)}`);
          jiosaavnUrl = url;
          break;
        }
      }

      if (jiosaavnUrl) {
        console.log(`\n🎵 STEP 1: JIOSAAVN URL DETECTED`);
        console.log(`   URL: ${jiosaavnUrl}`);
        console.log(`   ACTION: Fetching audio stream from JioSaavn`);
        
        try {
          const fetchUrl = `${backendUrl}/fetch-from-jiosaavvn-url`;
          console.log(`📤 Calling backend: POST ${fetchUrl}`);
          
          const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jiosaavnUrl }),
          });

          console.log(`📥 Backend response status: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Backend returned:`, {
              success: data.success,
              hasSong: !!data.song,
              title: data.song?.title,
              hasAudioUrl: !!data.song?.audioUrl,
            });

            if (data.success && data.song?.audioUrl) {
              const audioUrl = data.song.audioUrl.trim();
              if (audioUrl) {
                // Try direct CDN URL first (often works without proxy)
                console.log(`\n✅ STEP 2: AUDIO URL OBTAINED`);
                console.log(`   CDN URL: ${audioUrl.substring(0, 60)}...`);

                finalSong = {
                  ...finalSong,
                  url: audioUrl, // Use CDN URL directly
                  FileUrl: '', // Don't set FileUrl for external URLs
                  image: data.song.image || song.image,
                  artist: data.song.artist || song.artist,
                  album: data.song.album || song.album,
                };
              }
            }
          } else {
            console.warn(`⚠️ Backend error: ${response.status}`);
            const text = await response.text();
            console.warn(`   Response: ${text.substring(0, 200)}`);
          }
        } catch (err) {
          console.error(`❌ STEP 1 FAILED - Fetch error:`, err);
        }
      }

      // STEP 2: If no FileUrl after JioSaavn fetch, try backend database
      if (!finalSong.FileUrl) {
        console.log(`\n🔍 STEP 3: FETCHING FROM BACKEND DATABASE`);
        try {
          const response = await fetch(`${backendUrl}/getSongs`);
          const data = await response.json();
          const allSongs = Array.isArray(data) ? data : data.songs || data.data || [];
          
          console.log(`   Fetched ${allSongs.length} songs from backend`);

          const found = allSongs.find((s: any) => {
            const titleLower = s.title?.toLowerCase() || '';
            const songTitleLower = song.title?.toLowerCase() || '';
            const firstPart = Math.min(20, titleLower.length, songTitleLower.length);
            
            return (
              titleLower === songTitleLower ||
              titleLower.includes(songTitleLower.substring(0, firstPart)) ||
              songTitleLower.includes(titleLower.substring(0, firstPart))
            );
          });
          
          if (found?.FileUrl) {
            console.log(`✅ Found matching song in database: ${found.title}`);
            console.log(`   FileUrl: ${found.FileUrl.substring(0, 60)}`);
            finalSong = {
              ...finalSong,
              FileUrl: found.FileUrl,
              ImageUrl: found.ImageUrl || finalSong.ImageUrl,
            };
          } else {
            console.log(`⚠️ No matching song found in database`);
          }
        } catch (err) {
          console.error(`❌ STEP 3 FAILED:`, err);
        }
      }

      // STEP 3: Build final song object for PlayerContext
      // Validate and sanitize audioUrl to prevent "nan" or other invalid values
      let cleanAudioUrl = finalSong.url || (finalSong as any).audioUrl || '';
      if (typeof cleanAudioUrl === 'string') {
        cleanAudioUrl = cleanAudioUrl.trim();
        // IMPORTANT: Don't filter out URLs with ? in them (query parameters are valid)
        // Only filter out specific placeholder patterns
        if (cleanAudioUrl === 'nan' || cleanAudioUrl === 'NaN' || cleanAudioUrl === 'undefined' || cleanAudioUrl === 'null') {
          cleanAudioUrl = '';
        }
        // If it's a JioSaavn page URL (not extracted to audio), reject it
        if (cleanAudioUrl.includes('jiosaavn.com/song/') && !cleanAudioUrl.includes('/proxy-audio')) {
          console.warn('⚠️ Rejecting JioSaavn page URL (not audio stream):', cleanAudioUrl.substring(0, 80));
          cleanAudioUrl = '';
        }
        // Similar check for placeholder-like content
        if (cleanAudioUrl.includes('?text=Album') && !cleanAudioUrl.includes('/proxy-audio') && !cleanAudioUrl.includes('localhost')) {
          console.warn('⚠️ Rejecting placeholder URL:', cleanAudioUrl.substring(0, 80));
          cleanAudioUrl = '';
        }
      } else {
        cleanAudioUrl = '';
      }

      // Validate and sanitize FileUrl
      let cleanFileUrl = finalSong.FileUrl || '';
      if (typeof cleanFileUrl === 'string') {
        cleanFileUrl = cleanFileUrl.trim();
        // Remove invalid values
        if (cleanFileUrl === 'nan' || cleanFileUrl === 'NaN' || cleanFileUrl === 'undefined' || cleanFileUrl === 'null') {
          cleanFileUrl = '';
        }
        // If it's a JioSaavn page URL (not extracted to audio), reject it
        if (cleanFileUrl.includes('jiosaavn.com/song/') && !cleanFileUrl.includes('/proxy-audio')) {
          console.warn('⚠️ Rejecting JioSaavn page URL in FileUrl (not audio stream):', cleanFileUrl.substring(0, 80));
          cleanFileUrl = '';
        }
      } else {
        cleanFileUrl = '';
      }

      const songToPlay = {
        id: finalSong.id?.toString() || finalSong.title,
        title: finalSong.title,
        artist: finalSong.artist || finalSong.singer,
        singer: finalSong.singer,
        cover: normalizeImageUrl(finalSong.image) || normalizeImageUrl(finalSong.ImageUrl) || normalizeImageUrl((finalSong as any).cover),
        ImageUrl: finalSong.ImageUrl || finalSong.image || (finalSong as any).cover,
        duration: '3:00',
        genre: finalSong.genre,
        album: finalSong.album,
        FileUrl: cleanFileUrl,
        audioUrl: cleanAudioUrl,
      };

      console.log(`\n✅ FINAL SONG OBJECT:`, {
        title: songToPlay.title,
        artist: songToPlay.artist,
        hasFileUrl: !!songToPlay.FileUrl,
        hasAudioUrl: !!songToPlay.audioUrl,
        FileUrl: songToPlay.FileUrl?.substring(0, 80),
        audioUrl: songToPlay.audioUrl?.substring(0, 80),
      });

      // If we're here and still have the JioSaavn page URL, it means extraction failed
      if (!songToPlay.FileUrl && !songToPlay.audioUrl) {
        // Check if the original had a JioSaavn URL but we couldn't extract audio
        if (song.url?.includes('jiosaavn.com')) {
          throw new Error(
            `❌ Could not extract audio from JioSaavn for "${song.title}". ` +
            `The song page exists but audio stream could not be fetched. ` +
            `This might be due to a region restriction or account requirement.`
          );
        }
        
        throw new Error(
          `❌ No audio source available for "${song.title}". ` +
          `Neither FileUrl nor external URL found.`
        );
      }

      console.log(`\n▶️  CALLING playSong() with the prepared object`);
      playSong(songToPlay);
      console.log(`${'='.repeat(80)}\n`);
    } catch (err) {
      console.error('❌ ERROR in handlePlayRecommendation:', err);
      alert(`❌ Cannot play this song: ${err.message}`);
    }
  };

  const handleQueueSongClick = async (queueSong: Song) => {
    try {
      // DEBUG: Verify this function is being called
      console.clear(); // Clear previous logs
      console.log('═'.repeat(80));
      console.log('🎵 🎵 🎵 handleQueueSongClick CALLED 🎵 🎵 🎵');
      console.log('═'.repeat(80));
      console.log(`🔍 Searching for queue song: "${queueSong.title}" from API...`);
      
      // Validate song has required fields
      if (!queueSong.title) {
        console.error('❌ Queue song has no title:', queueSong);
        alert('❌ Invalid song data');
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
      
      // Fetch all songs from backend
      const response = await fetch(`${backendUrl}/getSongs`);
      const data = await response.json();
      const allSongs = Array.isArray(data) ? data : data.songs || data.data || [];
      
      // Search for song by title (case-insensitive, partial match)
      const foundSong = allSongs.find((backendSong: any) => {
        const queueTitle = queueSong.title?.toLowerCase() || '';
        const backendTitle = backendSong.title?.toLowerCase() || '';
        
        // Try exact match first, then substring match (first 20 chars)
        return (
          queueTitle === backendTitle ||
          backendTitle.includes(queueTitle.substring(0, 20)) ||
          queueTitle.includes(backendTitle.substring(0, 20))
        );
      });
      
      if (foundSong && foundSong.FileUrl) {
        console.log(`✅ Found song in API: ${foundSong.title}`);
        const enrichedSong = {
          ...queueSong,
          FileUrl: foundSong.FileUrl,
          ImageUrl: foundSong.ImageUrl || queueSong.ImageUrl,
          cover: foundSong.ImageUrl || queueSong.cover,
          genre: foundSong.genre || queueSong.genre,
          album: foundSong.album || queueSong.album,
          _id: foundSong._id || queueSong._id,
        };
        
        console.log('▶️ Playing queue song with API data:', {
          title: enrichedSong.title,
          hasFileUrl: !!enrichedSong.FileUrl,
          FileUrl: enrichedSong.FileUrl?.substring(0, 60),
        });
        
        playSong(enrichedSong);
      } else {
        console.warn(`⚠️ Song not found in API or no FileUrl, checking local data: ${queueSong.title}`);
        console.log(`📍 DEBUG: API_BASE_URL = ${API_BASE_URL}`);
        console.log(`📍 DEBUG: queueSong.audioUrl = ${(queueSong as any).audioUrl}`);
        console.log(`📍 DEBUG: Is audioUrl string? ${typeof (queueSong as any).audioUrl === 'string'}`);
        console.log(`📍 DEBUG: Is audioUrl jiosaavn? ${(queueSong as any).audioUrl?.includes('jiosaavn.com')}`);
        
        // Check if this is a JioSaavn URL that needs extraction
        let songToPlay = queueSong;
        
        // Check .audioUrl property for JioSaavn URLs
        const jiosaavnUrl = (queueSong as any).audioUrl;
        
        if (jiosaavnUrl && typeof jiosaavnUrl === 'string' && jiosaavnUrl.includes('jiosaavn.com')) {
          console.log(`🔗 Detected JioSaavn URL: ${jiosaavnUrl}`);
          
          try {
            const extractUrl = `${API_BASE_URL}/fetch-from-jiosaavvn-url`;
            console.log(`📤 Calling: POST ${extractUrl}`);
            const extractResponse = await fetch(extractUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jiosaavnUrl }),
            });
            
            console.log(`📥 Extraction response status: ${extractResponse.status}`);
            
            if (extractResponse.ok) {
              const responseData = await extractResponse.json();
              const extractedSong = responseData.song || responseData;
              console.log('✅ JioSaavn extraction successful');
              console.log(`   Extracted audioUrl: ${extractedSong.audioUrl?.substring(0, 80)}`);
              
              // Use proxy-audio endpoint for streaming (same as handlePlayRecommendation)
              if (extractedSong.audioUrl) {
                // Try direct CDN URL first (often works without proxy)
                // Only use proxy if direct CDN fails
                const proxiedUrl = `${API_BASE_URL}/proxy-audio?url=${encodeURIComponent(extractedSong.audioUrl)}`;
                songToPlay = { 
                  ...queueSong, 
                  ...extractedSong,
                  audioUrl: extractedSong.audioUrl, // Use CDN URL directly
                  FileUrl: '' // Don't set FileUrl for external URLs
                };
              } else {
                songToPlay = { ...queueSong, ...extractedSong };
              }
            } else {
              console.warn(`⚠️ Extraction failed: ${extractResponse.status}`);
              const errorText = await extractResponse.text();
              console.warn(`   Error: ${errorText.substring(0, 100)}`);
            }
          } catch (extractErr) {
            console.error('❌ Error extracting JioSaavn URL:', extractErr);
          }
        }
        
        // Validate has audio URL before playing
        if (!songToPlay.FileUrl && !songToPlay.audioUrl && !(songToPlay as any).url) {
          console.error('❌ Queue song has no audio URL:', songToPlay);
          alert('❌ This song has no audio file available. Please try another song.');
          return;
        }
        
        playSong(songToPlay);
      }
    } catch (err) {
      console.error('❌ Error in handleQueueSongClick:', err);
      
      // Still try to play if we can
      try {
        if (queueSong && queueSong.title && (queueSong.FileUrl || queueSong.audioUrl || (queueSong as any).url)) {
          playSong(queueSong);
        } else {
          alert('❌ Cannot play this song - no audio file available');
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback also failed:', fallbackErr);
        alert('❌ Error playing song');
      }
    }
  };

  const handleAddToQueue = async (song: RecommendedSong) => {
    try {
      // Use the already-enriched data from the recommendation
      const songToAdd = {
        id: song.id?.toString() || song.title,
        title: song.title,
        artist: song.artist || song.singer,
        singer: song.singer,
        // Use ML model image first, then enriched ImageUrl, then cover
        cover: normalizeImageUrl(song.image) || normalizeImageUrl(song.ImageUrl) || normalizeImageUrl(song.cover),
        ImageUrl: song.ImageUrl || song.image || song.cover, // Store both model and DB images
        duration: '3:00',
        genre: song.genre,
        album: song.album,
        FileUrl: song.FileUrl || '', // Already enriched from backend
        audioUrl: song.url || '', // Fallback to external URL
      };
      
      console.log('📝 Adding to queue:', songToAdd);
      addToQueue(songToAdd);
    } catch (err) {
      console.error('❌ Error adding to queue:', err);
      alert(`❌ Cannot add song to queue: ${err.message}`);
    }
  };

  if (!isQueueOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={toggleQueue}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-96 bg-card border-l border-border z-50 queue-panel flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Queue & Recommendations</h2>
          <button
            onClick={toggleQueue}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ML Service Status */}
        {!mlServiceAvailable && (
          <div className="px-4 py-3 bg-destructive/10 border-b border-destructive/20">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <WifiOff className="w-4 h-4" />
              <span>ML Service unavailable</span>
            </div>
            <p className="text-xs text-destructive/70 mt-1">
              Start ML service: <code className="bg-black/20 px-1 rounded">python -m uvicorn app.main:app --port 8000</code>
            </p>
          </div>
        )}

        {/* Now Playing */}
        {currentSong && (
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Now Playing</h3>
            <div className="flex items-center gap-3 p-3 bg-gradient-naavix-soft rounded-xl">
              <img
                src={normalizeImageUrl(currentSong.cover)}
                alt={currentSong.title}
                className="w-14 h-14 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate text-primary">{currentSong.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
              </div>
              <div className="flex items-end gap-0.5 h-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-primary animate-pulse"
                    style={{
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto">
          {/* Queue List */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                Up Next ({queue.length})
              </h3>
              {queue.length > 0 && (
                <button
                  onClick={() => enrichQueueSongsWithBackendData()}
                  className="px-2 py-1 text-xs bg-primary/20 text-primary hover:bg-primary/30 rounded transition-colors flex items-center gap-1"
                  title="Fetch queue songs from API"
                >
                  🔄 Sync
                </button>
              )}
            </div>
            {(() => {
              // Filter out the currently playing song from the queue display
              const filteredQueue = queue.filter(song => 
                !(song.id === currentSong?.id && song.title === currentSong?.title)
              );
              
              return filteredQueue.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                  <p className="text-sm">Queue is empty</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {filteredQueue.slice(0, 3).map((song, idx) => (
                    <li
                      key={`queue-${(song as any)._queueId || song._id || song.id || idx}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group cursor-pointer"
                      onClick={() => handleQueueSongClick(song)}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={normalizeImageUrl(song.cover)}
                          alt={song.title}
                          className="w-16 h-16 rounded-lg object-cover shadow-md"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                        <div className="absolute inset-0 rounded-lg bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-sm">{song.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(song.id);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>

          {/* Recommendations Section */}
          {mlServiceAvailable && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-500" />
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  AI Recommendations
                </h3>
                {isLoadingRecs && <Loader className="w-3 h-3 animate-spin text-primary" />}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg text-destructive text-sm mb-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {recommendations.length === 0 && !isLoadingRecs && !error && (
                <div className="text-center text-muted-foreground py-6">
                  <p className="text-sm">Play a song to get recommendations</p>
                </div>
              )}

              {recommendations.length > 0 && (
                <ul className="space-y-3">
                  {recommendations.map((song, idx) => (
                    <li
                      key={`${song.id}-${idx}`}
                      className="p-3 rounded-lg hover:bg-muted transition-colors group cursor-pointer"
                      onClick={() => handlePlayRecommendation(song)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={normalizeImageUrl(song.cover)}
                            alt={song.title}
                            className="w-16 h-16 rounded-lg object-cover shadow-md"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <div className="absolute inset-0 rounded-lg bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate text-sm">{song.title}</h4>
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
                              {Math.round(song.similarity_score * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {song.singer} • {song.genre}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedReason(expandedReason === song.id ? null : song.id);
                            }}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            {expandedReason === song.id ? '▼' : '▶'} {song.recommendation_reason}
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToQueue(song);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Add to queue"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer with Refresh Button */}
        {currentSong && mlServiceAvailable && (
          <div className="p-4 border-t border-border">
            <button
              onClick={fetchRecommendations}
              disabled={isLoadingRecs}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoadingRecs ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Get New Recommendations
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default QueuePanel;
