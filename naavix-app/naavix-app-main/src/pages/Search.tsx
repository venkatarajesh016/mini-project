import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { genres, artists, Song } from '@/data/mockData';
import MusicCard from '@/components/MusicCard';
import ArtistCard from '@/components/ArtistCard';
import { Input } from '@/components/ui/input';
import axios from 'axios';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [externalSongs, setExternalSongs] = useState<Song[]>([]);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);
  const [externalError, setExternalError] = useState<string | null>(null);
  
  // Cache for external search results to avoid repeated API calls
  const searchCacheRef = useRef<Record<string, Song[]>>({});

  // Fetch local songs on component mount
  useEffect(() => {
    axios.get("http://localhost:3000/getSongs")
      .then((response) => {
        setAllSongs(response.data);
      })
      .catch((error) => {
        console.error("Error fetching songs:", error);
      });
  }, []);

  // Fetch external songs when query changes
  useEffect(() => {
    const fetchExternalSongs = async () => {
      // Clear previous external results when starting a new search
      if (!isSearching) {
        setExternalSongs([]);
        setExternalError(null);
        return;
      }

      // Check if already cached
      if (searchCacheRef.current[query]) {
        setExternalSongs(searchCacheRef.current[query]);
        return;
      }

      try {
        setIsLoadingExternal(true);
        setExternalError(null);

        const response = await axios.get('http://localhost:3000/external-songs', {
          params: { q: query },
          timeout: 10000,
        });

        const songs = response.data.songs || [];
        
        // Cache the results
        searchCacheRef.current[query] = songs;
        setExternalSongs(songs);

        if (!response.data.success) {
          setExternalError('External songs unavailable');
        }
      } catch (error) {
        console.error('Error fetching external songs:', error);
        setExternalError('External songs unavailable');
        setExternalSongs([]);
      } finally {
        setIsLoadingExternal(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      if (query.trim()) {
        fetchExternalSongs();
      } else {
        setExternalSongs([]);
        setExternalError(null);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [query, isSearching]);

  const filteredSongs = allSongs.filter(
    (song) =>
      (song.title?.toLowerCase() || '').includes(query.toLowerCase()) ||
      (song.artist?.toLowerCase() || '').includes(query.toLowerCase()) ||
      (song.album?.toLowerCase() || '').includes(query.toLowerCase())
  );

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(query.toLowerCase())
  );

  const trendingSearches = ['Srivalli', 'Sid Sriram', 'Naatu Naatu', 'Buttabomma', 'Anirudh'];

  return (
    <div className="min-h-screen pb-32 px-6 py-8">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-6 text-center gradient-text">Search</h1>
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsSearching(e.target.value.length > 0);
            }}
            className="w-full h-14 pl-12 pr-12 bg-card border-border focus:border-primary rounded-2xl text-lg"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsSearching(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {!isSearching ? (
        <>
          {/* Trending Searches */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Trending Searches</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {trendingSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => {
                    setQuery(search);
                    setIsSearching(true);
                  }}
                  className="px-4 py-2 bg-card rounded-full text-sm font-medium hover:bg-muted transition-colors hover:scale-105"
                >
                  {search}
                </button>
              ))}
            </div>
          </section>

          {/* Browse by Genre */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Browse All</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {genres.map((genre) => (
                <div
                  key={genre.id}
                  className={`relative aspect-[2/1] rounded-2xl overflow-hidden cursor-pointer group bg-gradient-to-br ${genre.color} hover:scale-105 transition-transform duration-300`}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <img
                    src={genre.image}
                    alt={genre.name}
                    className="absolute right-0 bottom-0 w-24 h-24 object-cover rotate-12 translate-x-4 translate-y-4 opacity-80"
                  />
                  <div className="relative p-4">
                    <h3 className="text-xl font-bold text-white">{genre.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Artists */}
          <section className="mt-10">
            <h2 className="text-2xl font-bold mb-6">Popular Artists</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Search Results */}
          {filteredArtists.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4">Artists</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {filteredSongs.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4">Local Library</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredSongs.map((song) => (
                  <MusicCard key={song.id || song._id} song={song} />
                ))}
              </div>
            </section>
          )}

          {/* External Search Results */}
          {isLoadingExternal && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                Searching...
              </h2>
            </section>
          )}

          {externalError && !isLoadingExternal && (
            <section className="mb-10">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{externalError}</p>
              </div>
            </section>
          )}

          {externalSongs.length > 0 && !isLoadingExternal && (
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4">Search Results</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {externalSongs.map((song) => (
                  <MusicCard 
                    key={song._id || song.id} 
                    song={song} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* No results message */}
          {!isLoadingExternal && filteredSongs.length === 0 && externalSongs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl font-semibold text-muted-foreground">
                No results found for "{query}"
              </p>
              <p className="text-muted-foreground mt-2">
                Try searching for something else
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
