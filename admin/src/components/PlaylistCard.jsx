import { useNavigate } from 'react-router-dom';
import '../styles/PlaylistCard.css';

export default function PlaylistCard({ playlist }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/playlist/${playlist.id}`, { state: { playlist } });
  };

  return (
    <div className="playlist-card" onClick={handleClick}>
      <div className="playlist-image-wrapper">
        {playlist.image ? (
          <img src={playlist.image} alt={playlist.title} className="playlist-image" />
        ) : (
          <div className="playlist-image-placeholder">
            <span>♪</span>
          </div>
        )}
        <div className="playlist-overlay">
          <button className="play-button">▶</button>
        </div>
      </div>
      <div className="playlist-info">
        <h3 className="playlist-title">{playlist.title}</h3>
        <p className="playlist-description">{playlist.description}</p>
        <span className="playlist-count">{playlist.songCount} songs</span>
      </div>
    </div>
  );
}
