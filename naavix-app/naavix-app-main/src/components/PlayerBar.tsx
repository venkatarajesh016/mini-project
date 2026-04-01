import React from 'react';
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
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import MusicVisualizer from './MusicVisualizer';
import { Slider } from '@/components/ui/slider';

const PlayerBar: React.FC = () => {
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

  if (!currentSong) return null;

  const formatTime = (percent: number) => {
    const totalSeconds = duration || 225; // Fallback to 3:45
    const currentSeconds = Math.floor((percent / 100) * totalSeconds);
    const mins = Math.floor(currentSeconds / 60);
    const secs = currentSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-card/95 backdrop-blur-xl border-t border-border z-50">
      <div className="h-full flex items-center justify-between px-4 max-w-screen-2xl mx-auto">
        {/* Left - Song Info */}
        <div className="flex items-center gap-4 w-72 min-w-0">
          <div className="relative group">
            <img
              src={currentSong.ImageUrl ? `http://localhost:3000/uploads/${currentSong.ImageUrl}` : currentSong.cover}
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
    </div>
  );
};

export default PlayerBar;
