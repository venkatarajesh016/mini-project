import React from 'react';
import { playlists } from '@/data/mockData';
import PlaylistCard from '@/components/PlaylistCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Playlists: React.FC = () => {
  return (
    <div className="min-h-screen pb-32 px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Your Playlists</h1>
        <Button className="btn-gradient rounded-xl gap-2">
          <Plus className="w-4 h-4" />
          Create Playlist
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </div>
  );
};

export default Playlists;
