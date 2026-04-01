import React from 'react';
import { Play, MoreHorizontal, Plus } from 'lucide-react';
import { Song } from '@/data/mockData';
import { usePlayer } from '@/context/PlayerContext';

interface MusicCardProps {
  song: Song;
  variant?: 'default' | 'compact' | 'large';
}

const MusicCard: React.FC<MusicCardProps> = ({ song, variant = 'default' }) => {
  const { playSong, addToQueue, currentSong, isPlaying } = usePlayer();
  const isCurrentSong =  song.id;

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
  const getImageSrc = (s: Song) => {
    if (!s) return '';
    
    // First check for direct cover string
    if (s.cover && typeof s.cover === 'string' && /^https?:\/\//.test(s.cover)) return s.cover;
    
    // Check for image array (from API like JioSaavn playlists)
    const imageData = (s as any).image;
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
    const imageFile = (s as any).ImageUrl || (s as any).imageUrl || (s as any).cover;
    if (!imageFile) return '';
    
    let fileStr = String(imageFile).replace(/\\\\/g, '/');
    fileStr = fileStr.replace(/^\//, '');
    if (/^https?:\/\//.test(fileStr)) return fileStr;
    if (fileStr.startsWith('uploads/')) return `${BACKEND_URL}/${fileStr}`;
    return `${BACKEND_URL}/uploads/${fileStr}`;
  };

  if (variant === 'compact') {
    return (
      <div
        onClick={() => playSong(song)}
        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer group transition-all duration-200 ${
          isCurrentSong ? 'bg-gradient-naavix-soft' : 'hover:bg-muted'
        }`}
      >
        <div className="relative">
          <img
            src={getImageSrc(song)}
            alt={song.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-5 h-5 text-white fill-current" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium truncate ${isCurrentSong ? 'text-primary' : ''}`}>
            {song.title}
          </h4>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
        </div>
        {isCurrentSong && isPlaying && (
          <div className="flex items-end gap-0.5 h-4">
              <div
                key={song.id}
                className="w-1 rounded-full bg-primary animate-pulse"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${0.1}s`,
                }}
              />
          </div>
        )}
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div
        className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer music-card"
        onClick={() => playSong(song)}
      >
        <img
          src={getImageSrc(song)}
          alt={song.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold text-white mb-1">{song.title}</h3>
          <p className="text-white/80">{song.artist}</p>
        </div>
        <button
          className="play-overlay absolute bottom-6 right-6 w-14 h-14 rounded-full btn-gradient flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            playSong(song);
          }}
        >
          <Play className="w-6 h-6 text-white fill-current ml-0.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="group bg-card rounded-xl p-4 cursor-pointer music-card"
      onClick={() => playSong(song)}
    >
      <div className="relative mb-4">
        <img
          src={getImageSrc(song)}
          alt={song.title}
          className="w-full aspect-square rounded-lg object-cover shadow-lg"
        />
        <button
          className="play-overlay absolute bottom-2 right-2 w-12 h-12 rounded-full btn-gradient flex items-center justify-center shadow-xl"
          onClick={(e) => {
            e.stopPropagation();
            playSong(song);
          }}
        >
          <Play className="w-5 h-5 text-white fill-current ml-0.5" />
        </button>
        <button
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            addToQueue(song);
          }}
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>
      <h4 className={`font-semibold truncate mb-1 ${isCurrentSong ? 'text-primary' : ''}`}>
        {song.title}
      </h4>
      <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
    </div>
  );
};

export default MusicCard;
