import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Settings, LogOut, User, Music, Heart, ListMusic, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { icon: Music, label: 'Songs Played', value: '1,234' },
    { icon: Heart, label: 'Liked Songs', value: '89' },
    { icon: ListMusic, label: 'Playlists', value: '12' },
    { icon: Clock, label: 'Listening Time', value: '48h' },
  ];

  const menuItems = [
    { icon: User, label: 'Edit Profile', onClick: () => {} },
    { icon: Settings, label: 'Settings', onClick: () => {} },
    { icon: LogOut, label: 'Logout', onClick: () => { logout(); navigate('/login'); } },
  ];

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, hsla(32, 95%, 55%, 0.3) 0%, hsla(322, 93%, 53%, 0.3) 50%, hsla(270, 70%, 45%, 0.3) 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <div className="relative px-6 py-12 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/30 shadow-2xl"
            />
            <div className="absolute inset-0 rounded-full ring-2 ring-white/10" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card rounded-2xl p-4 text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-6 mt-8">
        <div className="bg-card rounded-2xl overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center gap-4 p-4 hover:bg-muted transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-border' : ''
              } ${item.label === 'Logout' ? 'text-destructive' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1 text-left font-medium">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
