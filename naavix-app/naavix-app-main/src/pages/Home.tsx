import React, { useState, useEffect } from 'react';
import MusicCard from '@/components/MusicCard';
import PlaylistCard from '@/components/PlaylistCard';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
const Home: React.FC = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          console.log('Fetching from:', `${API_URL}/api/playlists`);
          
          // Fetch playlists
          const playlistResponse = await axios.get(`${API_URL}/api/playlists`, {
            timeout: 10000,
          });
          const playlistsData = playlistResponse.data.data || [];
          setPlaylists(playlistsData);
          
          // Set first playlist songs
          if (playlistsData.length > 0) {
            setSongs(playlistsData[0].songs?.slice(0, 6) || []);
          }
          
          // Fetch albums
          const albumResponse = await axios.get(`${API_URL}/api/albums`, {
            timeout: 10000,
          });
          const albumsData = albumResponse.data.data || [];
          setAlbums(albumsData);
          
          console.log("Fetched playlists:", playlistsData);
          console.log("Fetched albums:", albumsData);
        } catch (error) {
          console.error("Error fetching data:", error);
          setError(error.message || 'Failed to fetch data');
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }, []);
  const recommendedSongs = songs.slice(2, 8);
  const trendingSongs = songs.slice(4, 10);
  const newReleases = songs.slice(10, 15);

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-naavix-magenta/20 via-background/80 to-background" />
        <div className="relative px-6 py-8">
          <h1 className="text-4xl font-bold mb-2">{getGreeting()}</h1>
          <p className="text-muted-foreground">Let's find something for you to enjoy</p>
        </div>
      </div>

      <div className="px-6 space-y-10">
        {/* Recently Played - Quick Access Grid */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {songs.map((song) => (
              <MusicCard key={song._id || song.id} song={song} variant="compact" />
            ))}
          </div>
        </section>

        {/* Your Playlists */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Playlists</h2>
            <Link to="/playlists" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {error ? (
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 mb-4">
              <p className="text-destructive text-sm">⚠️ {error}</p>
              <p className="text-xs text-muted-foreground mt-2">Make sure backend is running on port 3000. Set REACT_APP_API_URL environment variable if needed.</p>
            </div>
          ) : loading ? (
            <p className="text-muted-foreground">Loading playlists...</p>
          ) : playlists.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {playlists.slice(0, 5).map((playlist) => (
                <PlaylistCard key={playlist.id || playlist._id} playlist={playlist} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No playlists available</p>
          )}
        </section>

        {/* Recommended for You */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recommended for You</h2>
            <Link to="/search" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recommendedSongs.map((song) => (
              <MusicCard key={song._id || song.id} song={song} />
            ))}
          </div>
        </section>

        {/* Top Albums */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Top Albums</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {albums.slice(0, 10).map((album) => {
              const getAlbumImage = () => {
                if (Array.isArray(album.image) && album.image.length > 0) {
                  return album.image[album.image.length - 1]?.url || album.image[0]?.url || '';
                }
                return typeof album.image === 'string' ? album.image : '';
              };
              return (
                <div key={album.id} className="group bg-card rounded-xl p-4 cursor-pointer music-card">
                  <div className="relative mb-4">
                    <img
                      src={getAlbumImage()}
                      alt={typeof album.title === 'object' ? album.title.name : album.title}
                      className="w-full aspect-square rounded-lg object-cover shadow-lg"
                    />
                  </div>
                  <h4 className="font-semibold truncate mb-1">{typeof album.title === 'object' ? album.title.name : album.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{album.artist} • {album.songsCount} songs</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
