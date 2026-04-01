import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Song, teluguSongs } from '../data/mockData';
import { normalizeSong } from '../services/normalizeSong';

interface PlayerContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    queue: Song[];
    volume: number;
    progress: number;
    playSong: (song: Song) => void;
    togglePlay: () => void;
    nextSong: () => void;
    prevSong: () => void;
    setVolume: (volume: number) => void;
    setProgress: (progress: number) => void;
    addToQueue: (song: Song) => void;
    removeFromQueue: (songId: string) => void;
    playPlaylist: (songs: Song[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentSong, setCurrentSong] = useState<Song | null>(teluguSongs[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState<Song[]>(teluguSongs.slice(1, 6));
    const [volume, setVolumeState] = useState(70);
    const [progress, setProgressState] = useState(35);

    const playSong = (song: Song) => {
        // Normalize the song to ensure it has audio URL
        const normalizedSong = normalizeSong(song);

        // Validate that song has audio URL
        if (!normalizedSong.audioUrl) {
            console.warn('Song does not have a valid audio URL', song);
            // You can set the current song anyway for UI purposes
        }

        setCurrentSong(normalizedSong);
        setIsPlaying(true);
        setProgressState(0);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    const nextSong = () => {
        if (queue.length > 0) {
            const [next, ...rest] = queue;
            if (currentSong) setQueue([...rest, currentSong]);
            const normalizedNext = normalizeSong(next);
            setCurrentSong(normalizedNext);
            setProgressState(0);
        }
    };

    const prevSong = () => {
        const randomIndex = Math.floor(Math.random() * teluguSongs.length);
        const normalizedSong = normalizeSong(teluguSongs[randomIndex]);
        setCurrentSong(normalizedSong);
        setProgressState(0);
    };

    const addToQueue = (song: Song) => {
        if (!queue.find(s => s.id === song.id)) {
            const normalizedSong = normalizeSong(song);
            setQueue([...queue, normalizedSong]);
        }
    };

    const removeFromQueue = (songId: string) => {
        setQueue(queue.filter(s => s.id !== songId));
    };

    const playPlaylist = (songs: Song[]) => {
        if (songs.length > 0) {
            const normalizedSongs = songs.map(s => normalizeSong(s));
            setCurrentSong(normalizedSongs[0]);
            setQueue(normalizedSongs.slice(1));
            setIsPlaying(true);
            setProgressState(0);
        }
    };

    return (
        <PlayerContext.Provider
            value={{
                currentSong,
                isPlaying,
                queue,
                volume,
                progress,
                playSong,
                togglePlay,
                nextSong,
                prevSong,
                setVolume: setVolumeState,
                setProgress: setProgressState,
                addToQueue,
                removeFromQueue,
                playPlaylist,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
