import React from 'react';
import { Heart } from 'lucide-react';
import { teluguSongs } from '@/data/mockData';
import { usePlayer } from '@/context/PlayerContext';
import { Play, Clock } from 'lucide-react';

const LikedSongs: React.FC = () => {
  const likedSongs = teluguSongs.filter((song) => song.isLiked);
  const { playSong, playPlaylist, currentSong, isPlaying } = usePlayer();

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, hsla(322, 93%, 53%, 0.5) 0%, hsla(270, 70%, 45%, 0.5) 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <div className="relative px-6 py-8 flex flex-col md:flex-row items-end gap-8">
          <div className="w-56 h-56 rounded-2xl bg-gradient-naavix flex items-center justify-center shadow-2xl">
            <Heart className="w-24 h-24 text-white fill-current" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Playlist</p>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">Liked Songs</h1>
            <p className="text-muted-foreground">{likedSongs.length} songs you love</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-6">
        <button
          onClick={() => playPlaylist(likedSongs)}
          className="w-14 h-14 rounded-full btn-gradient flex items-center justify-center hover:scale-105 transition-transform shadow-glow-primary"
        >
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </button>
      </div>

      {/* Song List */}
      <div className="px-6">
        <div className="grid grid-cols-[auto_1fr_1fr_auto] md:grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border">
          <span>#</span>
          <span>Title</span>
          <span className="hidden md:block">Album</span>
          <Clock className="w-4 h-4 mx-auto" />
        </div>

        <div className="mt-2">
          {likedSongs.map((song, index) => {
            const isCurrentSong = currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className={`grid grid-cols-[auto_1fr_1fr_auto] md:grid-cols-[40px_1fr_1fr_80px] gap-4 items-center px-4 py-3 rounded-lg cursor-pointer group transition-colors ${
                  isCurrentSong ? 'bg-gradient-naavix-soft' : 'hover:bg-card'
                }`}
              >
                <div className="relative w-6 text-center">
                  {isCurrentSong && isPlaying ? (
                    <div className="flex items-end gap-0.5 h-4 justify-center">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-0.5 rounded-full bg-primary animate-pulse"
                          style={{ height: `${40 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <>
                      <span className={`group-hover:hidden ${isCurrentSong ? 'text-primary' : 'text-muted-foreground'}`}>
                        {index + 1}
                      </span>
                      <Play className="w-4 h-4 hidden group-hover:block text-foreground fill-current" />
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <img src={song.cover} alt={song.title} className="w-10 h-10 rounded-md object-cover" />
                  <div className="min-w-0">
                    <h4 className={`font-medium truncate ${isCurrentSong ? 'text-primary' : ''}`}>{song.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                  </div>
                </div>

                <span className="hidden md:block text-sm text-muted-foreground truncate">{song.album}</span>

                <div className="flex items-center justify-end gap-2">
                  <Heart className="w-4 h-4 text-primary fill-current" />
                  <span className="text-sm text-muted-foreground">{song.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LikedSongs;
