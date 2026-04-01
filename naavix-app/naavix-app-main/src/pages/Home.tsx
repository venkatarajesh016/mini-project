import React, { useState, useEffect } from 'react';
import { teluguSongs, artists, albums } from '@/data/mockData';
import MusicCard from '@/components/MusicCard';
import PlaylistCard from '@/components/PlaylistCard';
import ArtistCard from '@/components/ArtistCard';
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

    useEffect(() => {
      axios.get("http://localhost:3000/getSongs")
        .then((response) => {
          setSongs(response.data.slice(0, 6));
          console.log("Fetched songs:", response.data[0]?.ImageUrl || "No Image URL found");
        })
        .catch((error) => {
          console.error("Error fetching songs:", error);
        });
    }, []);

    useEffect(() => {
      axios.get("http://localhost:3000/getAllAlbums")
        .then((response) => {
          setPlaylists(response.data);
          console.log("Fetched playlists:", response.data);
        }
        )
        .catch((error) => {
          console.error("Error fetching playlists:", error);
        });
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
              <MusicCard key={song._id} song={song} variant="compact" />
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {playlists.slice(0, 5).map((playlist) => (
              <PlaylistCard key={playlist._id} playlist={playlist} />
            ))}
          </div>
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

        {/* Popular Artists */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Popular Artists</h2>
            <Link to="/library" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>

        {/* Trending Now */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Trending Now 🔥</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trendingSongs.map((song) => (
              <MusicCard key={song._id || song.id} song={song} />
            ))}
          </div>
        </section>

        {/* New Releases */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">New Releases</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {newReleases.map((song) => (
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
            {albums.map((album) => (
              <div key={album.id} className="group bg-card rounded-xl p-4 cursor-pointer music-card">
                <div className="relative mb-4">
                  <img
                    src={album.cover}
                    alt={album.name}
                    className="w-full aspect-square rounded-lg object-cover shadow-lg"
                  />
                </div>
                <h4 className="font-semibold truncate mb-1">{album.name}</h4>
                <p className="text-sm text-muted-foreground truncate">{album.artist} • {album.year}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
