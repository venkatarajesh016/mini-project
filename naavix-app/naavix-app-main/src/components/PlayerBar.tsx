import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  ListMusic,
  Maximize2,
  Activity,
  X,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import MusicVisualizer from './MusicVisualizer';
import { Slider } from '@/components/ui/slider';

const PlayerBar: React.FC = () => {
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    togglePlay,
    nextSong,
    prevSong,
    setVolume,
    setProgress,
    toggleQueue,
    toggleVisualizer,
    isVisualizerOn,
  } = usePlayer();

  const BACKEND_URL = 'http://localhost:3000';

  const getImageSrc = () => {
    if (!currentSong) return '';

    // Check for direct cover string
    if (currentSong.cover && typeof currentSong.cover === 'string' && /^https?:\/\//.test(currentSong.cover)) {
      return currentSong.cover;
    }

    // Check for image array (from API like JioSaavn)
    const imageData = (currentSong as any).image;
    if (Array.isArray(imageData) && imageData.length > 0) {
      const imageObj = imageData[imageData.length - 1];
      if (imageObj && imageObj.url && typeof imageObj.url === 'string') {
        if (/^https?:\/\//.test(imageObj.url)) return imageObj.url;
      }
    }

    // Check for image as direct URL string (from external-songs search)
    if (typeof imageData === 'string' && /^https?:\/\//.test(imageData)) {
      return imageData;
    }

    // Check for direct ImageUrl or imageUrl properties
    const imageFile = (currentSong as any).ImageUrl || (currentSong as any).imageUrl;
    if (imageFile) {
      if (typeof imageFile === 'string') {
        if (/^https?:\/\//.test(imageFile)) return imageFile;
        return `${BACKEND_URL}/uploads/${imageFile}`;
      }
    }

    return '';
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-card/95 backdrop-blur-xl border-t border-border z-50">
      <div className="h-full flex items-center justify-between px-4 max-w-screen-2xl mx-auto">
        {/* Left - Song Info */}
        <div className="flex items-center gap-4 w-72 min-w-0">
          <div className="relative group cursor-pointer" onClick={() => setShowNowPlaying(true)}>
            <img
              src={getImageSrc()}
              alt={currentSong.title}
              className={`w-14 h-14 rounded-lg object-cover shadow-lg ${
                isPlaying ? 'animate-pulse' : ''
              }`}
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <MusicVisualizer />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold truncate text-foreground">{currentSong.title}</h4>
            <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Center - Controls */}
        <div className="flex flex-col items-center flex-1 max-w-xl">
          <div className="flex items-center gap-4 mb-2">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={prevSong}
              className="p-2 text-foreground hover:scale-105 transition-transform"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full btn-gradient flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
            <button
              onClick={nextSong}
              className="p-2 text-foreground hover:scale-105 transition-transform"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(progress)}
            </span>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={1}
              className="flex-1 cursor-pointer"
            />
            <span className="text-xs text-muted-foreground w-10">{currentSong.duration}</span>
          </div>
        </div>

        {/* Right - Volume & Extra Controls */}
        <div className="flex items-center gap-3 w-72 justify-end">
          <button
            onClick={toggleVisualizer}
            className={`p-2 transition-colors ${
              isVisualizerOn ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="w-5 h-5" />
          </button>
          <button
            onClick={toggleQueue}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ListMusic className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 w-32">
            <button
              onClick={() => setVolume(volume === 0 ? 70 : 0)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Now Playing Modal */}
      {showNowPlaying && currentSong && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowNowPlaying(false)}>
          <div className="relative w-full h-full flex flex-col items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowNowPlaying(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-8 h-8 text-white" />
            </button>

            <div className="max-w-md w-full">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl mb-8 animate-in fade-in">
                <img
                  src={getImageSrc()}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-2">{currentSong.title}</h1>
                <p className="text-xl text-white/70 mb-8">{currentSong.artist}</p>

                {currentSong.album && (
                  <p className="text-sm text-white/50 mb-8">
                    {typeof currentSong.album === 'object'
                      ? currentSong.album.name || currentSong.album
                      : currentSong.album}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mb-8">
                  <Slider
                    value={[progress]}
                    onValueChange={(value) => setProgress(value[0])}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>{formatTime(progress)}</span>
                    <span>{currentSong.duration || '0:00'}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-6">
                  <button className="p-3 text-white/70 hover:text-white transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button
                    onClick={prevSong}
                    className="p-3 text-white hover:scale-105 transition-transform"
                  >
                    <SkipBack className="w-8 h-8 fill-current" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 fill-white text-white" />
                    ) : (
                      <Play className="w-8 h-8 fill-white text-white ml-1" />
                    )}
                  </button>
                  <button
                    onClick={nextSong}
                    className="p-3 text-white hover:scale-105 transition-transform"
                  >
                    <SkipForward className="w-8 h-8 fill-current" />
                  </button>
                  <button className="p-3 text-white/70 hover:text-white transition-colors">
                    <Repeat className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function formatTime(percent: number) {
    const totalSeconds = duration || 225;
    const currentSeconds = Math.floor((percent / 100) * totalSeconds);
    const mins = Math.floor(currentSeconds / 60);
    const secs = currentSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
};

export default PlayerBar;
