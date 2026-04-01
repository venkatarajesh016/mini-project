import { useNavigate } from 'react-router-dom';
import '../styles/AlbumCard.css';

export default function AlbumCard({ album }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/album/${album.id}`, { state: { album } });
  };

  return (
    <div className="album-card" onClick={handleClick}>
      <div className="album-image-wrapper">
        {album.image ? (
          <img src={album.image} alt={album.title} className="album-image" />
        ) : (
          <div className="album-image-placeholder">
            <span>♪</span>
          </div>
        )}
        <div className="album-overlay">
          <button className="play-button">▶</button>
        </div>
      </div>
      <div className="album-info">
        <h3 className="album-title">{album.title}</h3>
        <p className="album-artist">{album.artist}</p>
        <div className="album-meta">
          <span className="album-year">{album.year}</span>
          <span className="album-count">{album.songCount} songs</span>
        </div>
      </div>
    </div>
  );
}
