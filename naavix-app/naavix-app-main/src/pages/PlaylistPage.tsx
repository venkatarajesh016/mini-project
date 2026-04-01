import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Heart, MoreHorizontal, Clock, Shuffle, Download } from 'lucide-react';
import { artists, Playlist, playlists, Song, teluguSongs } from '@/data/mockData';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/ui/button';
import axios from 'axios';

import { useState } from 'react';

const PlaylistPage: React.FC = () => {
  const { playlistId } = useParams();
  const { playSong, playPlaylist, currentSong, isPlaying } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]); // Default to first playlist's songs
  const [albumName, setAlbumName] = useState({
    title: '',
    ImageUrl: '',
    genre: '',
    artist: '',
  });

  const getAllSongsFromPlaylist = async(playlistId: string) => {
    try{
       await axios.get(`http://localhost:3000/getSongsByAlbum/${playlistId}`)
        .then((response) => {
          setSongs(response.data);
          console.log("Fetched songs for playlist:", response.data);
        })
        .catch((error) => {
          console.error("Error fetching songs for playlist:", error);
        });
    }
    catch(error){
      console.error("Error in getAllSongsFromPlaylist:", error);
    }
  };

  const getPlaylistDetails = async(playlistId: string) => {
    try{
      await axios.get(`http://localhost:3000/getAlbumById/${playlistId}`)
        .then((response) => {
          const playlistData = response.data;
          setAlbumName({
            title: playlistData.title,
            ImageUrl: playlistData.ImageUrl,
            genre: playlistData.genre,
            artist: playlistData.artist,
          });
          console.log("Fetched playlist details:", playlistData);
        })
        .catch((error) => {
          console.error("Error fetching playlist details:", error);
        });
    }
    catch(error){
      console.error("Error in getPlaylistDetails:", error);
    }
  };
  useEffect(() => {
    getAllSongsFromPlaylist(playlistId);
    getPlaylistDetails(playlistId);
  }, [playlistId]);

  return (
    <div className="min-h-screen pb-32">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, hsla(32, 95%, 55%, 0.4) 0%, hsla(322, 93%, 53%, 0.4) 50%, hsla(270, 70%, 45%, 0.4) 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="relative px-6 py-8 flex flex-col md:flex-row items-end gap-8">
          {/* Cover Image */}
          <div className="relative">
            <img
              src={`http://localhost:3000/uploads/${albumName.ImageUrl}`} // Assuming cover is a path to the image
              alt={albumName.title}
              className="w-56 h-56 rounded-2xl object-cover shadow-2xl"
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Playlist</p>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">{albumName.genre}</h1>
            <p className="text-muted-foreground mb-4">{albumName.artist}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Naavix</span>
              <span>•</span>
              <span> songs</span>
              <span>•</span>
              <span>About 45 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-6 flex items-center gap-4">
        <button
          onClick={() => playPlaylist(songs)}
          className="w-14 h-14 rounded-full btn-gradient flex items-center justify-center hover:scale-105 transition-transform shadow-glow-primary"
        >
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </button>
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full hover:bg-muted">
          <Shuffle className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full hover:bg-muted">
          <Heart className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full hover:bg-muted">
          <Download className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full hover:bg-muted">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Song List */}
      <div className="px-6">
        {/* Header */}
        <div className="grid grid-cols-[auto_1fr_1fr_auto] md:grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border">
          <span>#</span>
          <span>Title</span>
          <span className="hidden md:block">Album</span>
          <Clock className="w-4 h-4 mx-auto" />
        </div>

        {/* Songs */}
        <div className="mt-2">
          {songs.map((song, index) => {
            const getId = (s: any) => s?.id ?? s?._id;
            const isCurrentSong = getId(currentSong) === getId(song);
            
            return (
              <div
                key={getId(song) || index}
                onClick={() => playSong(song)}
                className={`grid grid-cols-[auto_1fr_1fr_auto] md:grid-cols-[40px_1fr_1fr_80px] gap-4 items-center px-4 py-3 rounded-lg cursor-pointer group transition-colors ${
                  isCurrentSong && isPlaying ? 'bg-gradient-naavix-soft' : 'hover:bg-card'
                }`}
              >
                {/* Number / Play Icon */}
                <div className="relative w-6 text-center">
                  {isCurrentSong && isPlaying ? (
                    <div className="flex items-end gap-0.5 h-4 justify-center">
                      {[1,2,3].map((i) => (
                        <div
                          key={i}
                          className="w-0.5 rounded-full bg-primary animate-pulse"
                          style={{
                            height: `${40 + Math.random() * 60}%`,
                            animationDelay: `${i * 0.1}s`,
                          }}
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

                {/* Song Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={`http://localhost:3000/uploads/${song.ImageUrl}`} // Assuming cover is a path to the image
                    alt={song.title}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                  <div className="min-w-0">
                    <h4 className={`font-medium truncate ${isCurrentSong ? 'text-primary' : ''}`}>
                      {song.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">{albumName.artist}</p>
                  </div>
                </div>

                {/* Album */}
                <span className="hidden md:block text-sm text-muted-foreground truncate">
                  {albumName.title}
                </span>

                {/* Duration & Actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      song.isLiked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${song.isLiked ? 'fill-current' : ''}`} />
                  </button>
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

export default PlaylistPage;
