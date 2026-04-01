import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/AlbumDetail.css';

export default function AlbumDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const album = location.state?.album;

  if (!album) {
    return (
      <div className="detail-container">
        <button onClick={() => navigate('/')} className="back-button">← Back</button>
        <p>Album not found</p>
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
          {album.image ? (
            <img src={album.image} alt={album.title} className="detail-image" />
          ) : (
            <div className="detail-image-placeholder">♪</div>
          )}
        </div>

        <div className="detail-info">
          <h1>{album.title}</h1>
          <p className="detail-artist">{album.artist}</p>
          <p className="detail-year">{album.year}</p>
          <p className="detail-count">{album.songCount} songs</p>
          <button className="detail-play-button">▶ Play All</button>
        </div>
      </div>

      <div className="songs-list">
        <h2>Tracks</h2>
        <div className="songs-table">
          {album.songs.map((song, index) => (
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
