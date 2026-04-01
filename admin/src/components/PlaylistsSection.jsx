import { useNavigate } from 'react-router-dom';
import PlaylistCard from './PlaylistCard';
import '../styles/PlaylistsSection.css';

export default function PlaylistsSection({ playlists }) {
  return (
    <section className="playlists-section">
      <div className="section-header">
        <h2>Playlists</h2>
      </div>
      <div className="playlists-scroll">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </section>
  );
}
