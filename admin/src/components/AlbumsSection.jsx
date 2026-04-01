import AlbumCard from './AlbumCard';
import '../styles/AlbumsSection.css';

export default function AlbumsSection({ albums }) {
  return (
    <section className="albums-section">
      <div className="section-header">
        <h2>Albums</h2>
      </div>
      <div className="albums-grid">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </section>
  );
}
