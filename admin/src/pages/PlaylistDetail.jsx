import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/PlaylistDetail.css';

export default function PlaylistDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const playlist = location.state?.playlist;

  if (!playlist) {
    return (
      <div className="detail-container">
        <button onClick={() => navigate('/')} className="back-button">← Back</button>
        <p>Playlist not found</p>
      </div>
    );
  }

  const handlePlaySong = (song) => {
    console.log('Playing:', song.title);
  };

  return (
    <div className="detail-container">
      <button onClick={() => navigate('/')} className="back-button">← Back</button>

      <div className="detail-header">
        <div className="detail-image-wrapper">
          {playlist.image ? (
            <img src={playlist.image} alt={playlist.title} className="detail-image" />
          ) : (
            <div className="detail-image-placeholder">♪</div>
          )}
        </div>

        <div className="detail-info">
          <h1>{playlist.title}</h1>
          <p className="detail-description">{playlist.description}</p>
          <p className="detail-count">{playlist.songCount} songs</p>
          <button className="detail-play-button">▶ Play All</button>
        </div>
      </div>

      <div className="songs-list">
        <h2>Songs</h2>
        <div className="songs-table">
          {playlist.songs.map((song, index) => (
            <div key={song.id} className="song-row">
              <span className="song-number">{index + 1}</span>
              <div className="song-details">
                <p className="song-title">{song.title}</p>
                <p className="song-artist">{song.artist}</p>
              </div>
              <button className="song-play-btn" onClick={() => handlePlaySong(song)}>
                ▶
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
