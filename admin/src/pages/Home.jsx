import { useHomeData } from '../hooks/useHomeData';
import PlaylistsSection from '../components/PlaylistsSection';
import AlbumsSection from '../components/AlbumsSection';
import '../styles/Home.css';

export default function Home() {
  const { data, loading, error } = useHomeData();

  if (loading) return <div className="home-loading">Loading...</div>;
  if (error) return <div className="home-error">Error: {error}</div>;

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Music Streaming</h1>
      </header>

      <main className="home-main">
        {data.playlists.length > 0 && <PlaylistsSection playlists={data.playlists} />}
        {data.albums.length > 0 && <AlbumsSection albums={data.albums} />}
      </main>
    </div>
  );
}
