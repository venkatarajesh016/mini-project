import React from 'react';
import { Artist } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

interface ArtistCardProps {
  artist: Artist;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const navigate = useNavigate();

  return (
    <div
      className="group flex flex-col items-center cursor-pointer"
      onClick={() => navigate(`/artist/${artist.id}`)}
    >
      <div className="relative mb-4 w-full aspect-square">
        <img
          src={artist.image}
          alt={artist.name}
          className="w-full h-full rounded-full object-cover shadow-lg group-hover:shadow-glow-primary transition-all duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-primary/30 transition-colors" />
      </div>
      <h4 className="font-semibold truncate text-center">{artist.name}</h4>
      <p className="text-sm text-muted-foreground">{artist.followers} followers</p>
    </div>
  );
};

export default ArtistCard;
