import React from 'react';
import { Play } from 'lucide-react';
import { Playlist } from '@/data/mockData';
import { usePlayer } from '@/context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

interface PlaylistCardProps {
  playlist: Playlist;
}


const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const { playPlaylist } = usePlayer();
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
  
  const getImageSrc = () => {
    // Check for image array first
    if (Array.isArray(playlist.image) && playlist.image.length > 0) {
      const imageObj = playlist.image[playlist.image.length - 1];
      if (imageObj && imageObj.url && /^https?:\/\//.test(imageObj.url)) {
        return imageObj.url;
      }
    }
    // Check for image as direct URL string
    if (typeof playlist.image === 'string' && /^https?:\/\//.test(playlist.image)) {
      return playlist.image;
    }
    // Fall back to ImageUrl
    if (playlist.ImageUrl) {
      if (/^https?:\/\//.test(playlist.ImageUrl)) return playlist.ImageUrl;
      return `${BACKEND_URL}/uploads/${playlist.ImageUrl}`;
    }
    return '';
  };

  return (
    <div
      className="group bg-card rounded-xl p-4 cursor-pointer music-card"
      onClick={() => {
        navigate(`/playlist/${playlist.id}`);
      }}
    >
      <div className="relative mb-4">
        <img
          src={getImageSrc()} // Assuming cover is a path to the image
          alt={playlist.title}
          className="w-full aspect-square rounded-lg object-cover shadow-lg"
        />
        <button
          className="play-overlay absolute bottom-2 right-2 w-12 h-12 rounded-full btn-gradient flex items-center justify-center shadow-xl"
          onClick={(e) => {
            e.stopPropagation();
            playPlaylist(playlist.songs);
          }}
        >
          <Play className="w-5 h-5 text-white fill-current ml-0.5" />
        </button>
      </div>
      <h4 className="font-semibold truncate mb-1">{playlist.title}</h4>
      {/* <p className="text-sm text-muted-foreground truncate">{playlist.description}</p> */}
    </div>
  );
};

export default PlaylistCard;
