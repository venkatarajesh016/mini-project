import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { playlists as mockPlaylists, albums, artists, Playlist } from '@/data/mockData';
import PlaylistCard from '@/components/PlaylistCard';
import ArtistCard from '@/components/ArtistCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);
  const [loading, setLoading] = useState(true);

  // Fetch playlists from API
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/playlists');
        const apiPlaylists = response.data.data;
        
        // Transform API playlists to match Playlist type
        const transformedPlaylists: Playlist[] = apiPlaylists.map((playlist: any) => {
          // Extract image URL from image array (API returns array with quality/url pairs)
          let imageUrl = '';
          if (Array.isArray(playlist.image) && playlist.image.length > 0) {
            // Get the highest quality image (usually last in array)
            imageUrl = playlist.image[playlist.image.length - 1]?.url || '';
          } else if (typeof playlist.image === 'string') {
            imageUrl = playlist.image;
          }
          
          return {
            id: playlist.id,
            name: playlist.title,
            description: playlist.description,
            cover: imageUrl || 'https://via.placeholder.com/300x300?text=Playlist',
            songs: playlist.songs || [],
            songCount: playlist.songsCount || (playlist.songs?.length || 0),
          };
        });
        
        setPlaylists(transformedPlaylists);
        console.log('Fetched playlists from API:', transformedPlaylists);
      } catch (error) {
        console.error('Error fetching playlists:', error);
        // Fallback to mock data on error
        setPlaylists(mockPlaylists);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <div className="min-h-screen pb-32 px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Your Library</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-card rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <Button className="btn-gradient rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Create Playlist
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="playlists" className="w-full">
        <TabsList className="bg-card border border-border mb-8">
          <TabsTrigger value="playlists" className="data-[state=active]:bg-gradient-naavix data-[state=active]:text-white">
            Playlists
          </TabsTrigger>
          <TabsTrigger value="albums" className="data-[state=active]:bg-gradient-naavix data-[state=active]:text-white">
            Albums
          </TabsTrigger>
          <TabsTrigger value="artists" className="data-[state=active]:bg-gradient-naavix data-[state=active]:text-white">
            Artists
          </TabsTrigger>
        </TabsList>

        {/* Playlists Tab */}
        <TabsContent value="playlists">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading playlists...</p>
              </div>
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No playlists found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="group bg-card rounded-xl p-4 cursor-pointer music-card hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <div className="relative mb-4">
                    <img
                      src={playlist.cover}
                      alt={playlist.name}
                      className="w-full aspect-square rounded-lg object-cover shadow-lg"
                    />
                  </div>
                  <h4 className="font-semibold truncate mb-1">{playlist.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {playlist.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-card transition-colors cursor-pointer group"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <img
                    src={playlist.cover}
                    alt={playlist.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{playlist.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Playlist • {playlist.songCount} songs
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Albums Tab */}
        <TabsContent value="albums">
          {viewMode === 'grid' ? (
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
                  <p className="text-sm text-muted-foreground truncate">
                    {album.artist} • {album.year}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-card transition-colors cursor-pointer"
                >
                  <img
                    src={album.cover}
                    alt={album.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{album.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {album.artist} • {album.year}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Artists Tab */}
        <TabsContent value="artists">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Library;
