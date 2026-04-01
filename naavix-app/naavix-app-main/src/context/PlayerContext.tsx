import React, { createContext, useContext, useState, ReactNode } from "react";
import { Song, teluguSongs } from "@/data/mockData";
import { useRef, useEffect } from "react";

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  volume: number;
  progress: number;
  duration: number;
  isQueueOpen: boolean;
  isVisualizerOn: boolean;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  toggleQueue: () => void;
  toggleVisualizer: () => void;
  playPlaylist: (songs: Song[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(teluguSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [volume, setVolumeState] = useState(70);
  const [progress, setProgressState] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isVisualizerOn, setIsVisualizerOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Ref to store next song function for use in event listeners
  const nextSongRef = useRef<() => void>(() => {});

  // Setup audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const currentProgress = (audio.currentTime / audio.duration) * 100;
        setProgressState(currentProgress);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      console.log('🎵 Song ended!');
      console.log(`   Title: ${currentSong?.title}`);
      console.log(`   Queue length: ${queue.length}`);
      console.log(`   Playing next song...`);
      // Call the latest version of nextSong via ref
      nextSongRef.current();
    };

    const handleError = () => {
      const error = audioRef.current?.error;
      if (!error) return;
      
      console.error('🔊 Audio Error Details:', {
        code: error.code,
        message: error.message,
        src: audioRef.current?.src,
        errorName: ['', 'MEDIA_ERR_ABORTED', 'MEDIA_ERR_NETWORK', 'MEDIA_ERR_DECODE', 'MEDIA_ERR_SRC_NOT_SUPPORTED'][error.code] || 'UNKNOWN'
      });
      
      // Provide user-friendly error messages
      let errorMessage = '';
      switch (error.code) {
        case 1: // MEDIA_ERR_ABORTED
          errorMessage = 'Playback was aborted.';
          break;
        case 2: // MEDIA_ERR_NETWORK
          errorMessage = 'A network error occurred. Check if server is running on port 3000.';
          break;
        case 3: // MEDIA_ERR_DECODE
          errorMessage = 'The audio file is corrupted or in an unsupported format.';
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          errorMessage = 'Could not play song. The audio file format may not be supported or the file does not exist.';
          break;
        default:
          errorMessage = 'Could not play song. This might be a demo song without actual audio.';
      }
      
      console.error('❌ ' + errorMessage);
      alert(errorMessage);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.volume = volume / 100;

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [volume]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Helper function to enrich song with audio URL from backend
  const enrichSongData = async (song: Song): Promise<Song> => {
    try {
      // If song already has audio URL or FileUrl, return as-is
      if (song.FileUrl || (song as any).audioUrl) {
        return song;
      }
      
      console.log(`🔍 Song missing audio data, fetching from backend: "${song.title}"`);
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/getSongs`);
      const data = await response.json();
      const allSongs = Array.isArray(data) ? data : data.songs || data.data || [];
      
      // Search for song by title
      const foundSong = allSongs.find((backendSong: any) => {
        const queueTitle = song.title?.toLowerCase() || '';
        const backendTitle = backendSong.title?.toLowerCase() || '';
        return queueTitle === backendTitle || backendTitle.includes(queueTitle.substring(0, 20));
      });
      
      if (foundSong && (foundSong.FileUrl || foundSong.audioUrl)) {
        console.log(`✅ Enriched song data from backend`);
        return {
          ...song,
          FileUrl: foundSong.FileUrl,
          audioUrl: foundSong.audioUrl,
          ImageUrl: foundSong.ImageUrl || song.ImageUrl,
          cover: foundSong.ImageUrl || song.cover,
          genre: foundSong.genre || song.genre,
          album: foundSong.album || song.album,
          _id: foundSong._id || song._id,
        };
      }
      
      console.warn(`⚠️ Could not find song data in backend`);
      return song;
    } catch (err) {
      console.error(`❌ Error enriching song data:`, err);
      return song;
    }
  };

  // Note: playSong is now regularly sync but enrichSongData can be called before it for async enrichment
  const playSong = (song: Song) => {
    if (!audioRef.current) return;

    // Early validation: Check if song object is valid
    if (!song || !song.title) {
      console.error('❌ Invalid song object:', song);
      setIsPlaying(false);
      alert('❌ Invalid song data. Cannot play.');
      return;
    }

    console.log('🎵 playSong called with:', {
      title: song.title,
      hasFileUrl: !!song.FileUrl,
      hasAudioUrl: !!(song as any).audioUrl,
      FileUrlType: typeof song.FileUrl,
      FileUrlValue: song.FileUrl ? song.FileUrl.substring(0, 60) : 'undefined',
      audioUrlType: typeof (song as any).audioUrl,
      audioUrlValue: (song as any).audioUrl ? String((song as any).audioUrl).substring(0, 60) : 'undefined'
    });

    // Support both local database songs and external API songs
    let audioUrl = '';
    
    if ('FileUrl' in song && song.FileUrl && typeof song.FileUrl === 'string') {
      // Handle different formats of FileUrl from database
      const fileUrlTrimmed = song.FileUrl.trim();
      
      // IMPORTANT: Never allow JioSaavn page URLs to be played directly
      if (fileUrlTrimmed.includes('jiosaavn.com/song/') && !fileUrlTrimmed.includes('/proxy-audio')) {
        console.error('❌ ERROR: JioSaavn page URL detected in FileUrl field (not audio stream):', fileUrlTrimmed.substring(0, 80));
        console.error('   This indicates JioSaavn extraction failed. Cannot play HTML page as audio.');
        setCurrentSong(song);
        setIsPlaying(false);
        alert('❌ Cannot play this JioSaavn song - audio extraction failed.\n\nMake sure the backend service is running and the song exists on JioSaavn.');
        return;
      }
      
      // Skip placeholder or invalid URLs
      if (!fileUrlTrimmed || fileUrlTrimmed.includes('?text=') || fileUrlTrimmed.includes('placeholder') || fileUrlTrimmed === 'nan' || fileUrlTrimmed === 'undefined') {
        console.warn('⚠️ FileUrl is a placeholder or invalid:', fileUrlTrimmed);
      } else {
        let filePath = fileUrlTrimmed;
        
        // Replace Windows backslashes with forward slashes
        filePath = filePath.replace(/\\/g, '/');
        
        // Remove "uploads/" prefix if it exists (case-insensitive)
        filePath = filePath.replace(/^uploads\//i, '');
        
        // Remove any leading slashes
        filePath = filePath.replace(/^\/+/, '');
        
        // URL-encode the path to handle spaces and special characters
        // Split by /, encode each part, then rejoin
        const encodedPath = filePath
          .split('/')
          .map(part => encodeURIComponent(part))
          .join('/');
        
        // Construct the full URL
        audioUrl = `http://localhost:3000/uploads/${encodedPath}`;
        
        console.log('🎵 Playing from backend:', {
          title: song.title,
          originalFileUrl: song.FileUrl,
          processedPath: filePath,
          encodedPath: encodedPath,
          finalUrl: audioUrl
        });
      }
    } else if ('audioUrl' in song && song.audioUrl && typeof song.audioUrl === 'string') {
      // Handle external URLs like JioSaavn - they need special handling
      let audioUrlTrimmed = String((song as any).audioUrl).trim();
      
      // IMPORTANT: Never allow JioSaavn page URLs to be played directly
      // They must be extracted to actual audio streams first
      if (audioUrlTrimmed.includes('jiosaavn.com/song/') && !audioUrlTrimmed.includes('/proxy-audio')) {
        console.error('❌ ERROR: JioSaavn page URL detected in audioUrl field (not audio stream):', audioUrlTrimmed.substring(0, 80));
        console.error('   This indicates JioSaavn extraction failed. Cannot play HTML page as audio.');
        setCurrentSong(song);
        setIsPlaying(false);
        alert('❌ Cannot play this JioSaavn song - audio extraction failed.\n\nMake sure the backend service is running and the song exists on JioSaavn.');
        return;
      }
      
      // Skip placeholder URLs and invalid values
      if (!audioUrlTrimmed || audioUrlTrimmed === 'nan' || audioUrlTrimmed === 'undefined' || audioUrlTrimmed.includes('?text=') || audioUrlTrimmed.includes('placeholder')) {
        console.warn('⚠️ audioUrl is a placeholder or invalid:', audioUrlTrimmed);
      } else {
        // Handle relative proxy URLs - make them absolute for validation
        if (audioUrlTrimmed.startsWith('/api/proxy-audio')) {
          const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
          audioUrl = `${backendUrl}${audioUrlTrimmed}`;
          console.log('🎵 Playing from backend proxy:', song.title);
        } else {
          audioUrl = audioUrlTrimmed;
        }
        
        // Safely log URL hostname only if it's a valid URL
        try {
          const urlObj = new URL(audioUrl);
          console.log('🎵 Playing from external URL:', song.title, '- URL Type:', urlObj.hostname);
        } catch (e) {
          console.log('🎵 Playing from external URL:', song.title, '- URL:', audioUrl.substring(0, 80));
        }
      }
    } else if ('url' in song && song.url && typeof song.url === 'string') {
      // Handle direct url property from external APIs (e.g., JioSaavn API responses)
      let urlTrimmed = String(song.url).trim();
      
      // IMPORTANT: Never allow JioSaavn page URLs to be played directly
      if (urlTrimmed.includes('jiosaavn.com/song/') && !urlTrimmed.includes('/proxy-audio')) {
        console.error('❌ ERROR: JioSaavn page URL detected in url field (not audio stream):', urlTrimmed.substring(0, 80));
        console.error('   This indicates JioSaavn extraction failed. Cannot play HTML page as audio.');
        setCurrentSong(song);
        setIsPlaying(false);
        alert('❌ Cannot play this JioSaavn song - audio extraction failed.\n\nMake sure the backend service is running and the song exists on JioSaavn.');
        return;
      }
      
      // Skip placeholder URLs and invalid values
      if (!urlTrimmed || urlTrimmed === 'nan' || urlTrimmed === 'undefined' || urlTrimmed.includes('?text=') || urlTrimmed.includes('placeholder')) {
        console.warn('⚠️ url is a placeholder or invalid:', urlTrimmed);
      } else {
        // Handle relative proxy URLs - make them absolute for validation
        if (urlTrimmed.startsWith('/api/proxy-audio')) {
          const backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
          audioUrl = `${backendUrl}${urlTrimmed}`;
          console.log('🎵 Playing from backend proxy:', song.title);
        } else {
          audioUrl = urlTrimmed;
        }
        
        // Safely log URL hostname only if it's a valid URL
        try {
          const urlObj = new URL(audioUrl);
          console.log('🎵 Playing from external URL:', song.title, '- URL Type:', urlObj.hostname);
        } catch (e) {
          console.log('🎵 Playing from external URL:', song.title, '- URL:', audioUrl.substring(0, 80));
        }
      }
    }

    if (!audioUrl) {
      console.warn('⚠️ Song does not have a valid audio URL:', song);
      setCurrentSong(song);
      setIsPlaying(false);
      alert('❌ This song does not have an audio file. Please try another song.');
      return;
    }
    
    // Validate that audioUrl is actually a valid URL
    if (audioUrl && typeof audioUrl === 'string') {
      // Check for NaN and other invalid values before URL construction
      if (audioUrl === 'nan' || audioUrl === 'NaN' || audioUrl === 'undefined' || audioUrl === 'null') {
        console.error('❌ Invalid audio URL (invalid value):', audioUrl);
        setCurrentSong(song);
        setIsPlaying(false);
        alert('❌ This song has an invalid audio URL. Please try another song.');
        return;
      }
      
      try {
        new URL(audioUrl);
      } catch (e) {
        console.error('❌ Invalid audio URL (URL construction failed):', audioUrl);
        setCurrentSong(song);
        setIsPlaying(false);
        alert('❌ This song has an invalid audio URL. Please try another song.');
        return;
      }
    }

    console.log('📤 Setting audio source:', audioUrl);
    audioRef.current.src = audioUrl;
    
    // Set current song and playing state BEFORE calling play()
    // This ensures the UI is updated before we attempt playback
    setCurrentSong(song);
    setProgressState(0);
    
    // Use setTimeout to ensure browser has time to load the audio element
    // and update all state changes before attempting playback
    setTimeout(() => {
      if (!audioRef.current) return;
      
      // Try to play the audio
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Audio playback started successfully');
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('❌ Playback failed:', err.name, err.message);
            setIsPlaying(false);
            
            // Provide specific error feedback
            if (err.name === 'NotAllowedError') {
              console.error('Playback was prevented. Check browser autoplay policy.');
            } else if (err.name === 'NotSupportedError') {
              console.error('Audio format not supported by browser');
            } else if (err.name === 'AbortError') {
              console.error('Playback was aborted - the media element may have been removed from the DOM.');
            }
          });
      } else {
        // If play() doesn't return a promise, the audio started playing
        setIsPlaying(true);
      }
    }, 0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // If we don't have a current song, don't try to play
      if (!currentSong) return;
      
      // If audio source is not set, try to play the current song
      if (!audioRef.current.src) {
        playSong(currentSong);
      } else {
        audioRef.current.play().catch(err => {
          console.error('Error resuming audio:', err);
        });
        setIsPlaying(true);
      }
    }
  };

  const nextSong = () => {
    console.log(`\n⏭️ nextSong called, current queue length: ${queue.length}`);
    
    // If queue has songs, play the next one in queue
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      console.log(`✅ Playing next from queue: "${next.title}"`);
      console.log(`   Remaining in queue after this: ${rest.length}`);
      
      if (currentSong) {
        setQueue([...rest, currentSong]);
      }
      
      // Enrich the song data if it doesn't have audio URL
      enrichSongData(next).then((enrichedSong) => {
        console.log(`📤 Enriched and playing: "${enrichedSong.title}"`);
        playSong(enrichedSong);
      }).catch((err) => {
        console.error(`❌ Error enriching song:`, err);
        // Still play even if enrichment fails
        playSong(next);
      });
    } else {
      // Fallback: If queue is empty, pick a random song from available songs
      // This ensures the next button always works
      console.log(`⚠️ Queue is empty, picking random song...`);
      const availableSongs = teluguSongs.filter(s => s.id !== currentSong?.id);
      if (availableSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        const nextSongToPlay = availableSongs[randomIndex];
        console.log(`🎲 Random song: "${nextSongToPlay.title}"`);
        
        // Enrich random song too
        enrichSongData(nextSongToPlay).then((enrichedSong) => {
          console.log(`📤 Enriched and playing: "${enrichedSong.title}"`);
          playSong(enrichedSong);
        }).catch((err) => {
          console.error(`❌ Error enriching song:`, err);
          playSong(nextSongToPlay);
        });
      } else if (teluguSongs.length > 0) {
        // If somehow current song is the only song, just restart it
        const randomIndex = Math.floor(Math.random() * teluguSongs.length);
        console.log(`🔄 Restarting from available songs`);
        enrichSongData(teluguSongs[randomIndex]).then((enrichedSong) => {
          playSong(enrichedSong);
        }).catch((err) => {
          playSong(teluguSongs[randomIndex]);
        });
      }
    }
  };

  // Update the ref whenever nextSong changes
  useEffect(() => {
    nextSongRef.current = nextSong;
  }, [queue, currentSong]);

  const prevSong = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // If more than 3 seconds in, restart current song
      audioRef.current.currentTime = 0;
    } else {
      // Otherwise play previous from queue or random
      const randomIndex = Math.floor(Math.random() * teluguSongs.length);
      const songToPlay = teluguSongs[randomIndex];
      console.log(`⏮️ Playing previous: "${songToPlay.title}"`);
      
      // Enrich song data
      enrichSongData(songToPlay).then((enrichedSong) => {
        console.log(`📤 Enriched and playing: "${enrichedSong.title}"`);
        playSong(enrichedSong);
      }).catch((err) => {
        console.error(`❌ Error enriching song:`, err);
        playSong(songToPlay);
      });
    }
  };

  const addToQueue = (song: Song) => {
    // Generate a unique queue item ID combining song info and timestamp
    const queueItemId = `${song.id || song.title}-${Date.now()}-${Math.random()}`;
    
    // Check if this exact song isn't already at the end of queue
    // (allowing duplicates at different times, but preventing immediate duplicates)
    const isDuplicate = queue.some((s) => 
      (s.id && s.id === song.id && s.title === song.title)
    );
    
    if (!isDuplicate) {
      // Add internal queue ID for unique key generation
      const queueSong = {
        ...song,
        _queueId: queueItemId, // Add internal ID for React keys
      };
      console.log(`➕ Added to queue: "${song.title}"`);
      setQueue([...queue, queueSong]);
    } else {
      console.warn(`⚠️ Song already in queue: "${song.title}"`);
    }
  };

  const removeFromQueue = (songId: string) => {
    setQueue(queue.filter((s) => s.id !== songId));
  };

  const toggleQueue = () => {
    setIsQueueOpen(!isQueueOpen);
  };

  const toggleVisualizer = () => {
    setIsVisualizerOn(!isVisualizerOn);
  };

  const playPlaylist = (songs: Song[]) => {
    if (songs.length > 0) {
      console.log(`▶️ Playing playlist with ${songs.length} songs`);
      setQueue(songs.slice(1));
      
      // Enrich first song before playing
      enrichSongData(songs[0]).then((enrichedSong) => {
        console.log(`📤 Playing first song from playlist: "${enrichedSong.title}"`);
        playSong(enrichedSong);
      }).catch((err) => {
        console.error(`❌ Error enriching first song:`, err);
        playSong(songs[0]);
      });
    }
  };

  // Handle progress seeking
  useEffect(() => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (progress / 100) * audioRef.current.duration;
      if (Math.abs(newTime - audioRef.current.currentTime) > 0.5) {
        audioRef.current.currentTime = newTime;
      }
    }
  }, [progress]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        volume,
        progress,
        duration,
        isQueueOpen,
        isVisualizerOn,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        setVolume: setVolumeState,
        setProgress: setProgressState,
        addToQueue,
        removeFromQueue,
        toggleQueue,
        toggleVisualizer,
        playPlaylist,
      }}
    >
      <audio ref={audioRef} crossOrigin="anonymous" />
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
