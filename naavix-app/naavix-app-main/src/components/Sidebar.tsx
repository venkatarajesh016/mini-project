import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, Heart, ListMusic, User, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  className?: string;
}

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Library, label: 'Library', path: '/library' },
];

const libraryItems = [
  { icon: Heart, label: 'Liked Songs', path: '/liked' },
  { icon: ListMusic, label: 'Playlists', path: '/playlists' },
];

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`w-64 h-full bg-sidebar flex flex-col ${className}`}>
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <img src={logo} alt="Naavix" className="w-10 h-10 object-contain" />
        <span className="text-2xl font-bold gradient-text">Naavix</span>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-gradient-naavix text-white shadow-glow-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive(item.path) ? 'text-white' : ''
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Library Section */}
        <div className="mt-8">
          <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Your Library
          </h3>
          <ul className="space-y-1">
            {libraryItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-gradient-naavix text-white shadow-glow-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive(item.path) ? 'text-white' : ''
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-border">
          <Link
            to="/profile"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/50"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </Link>
          <button
            onClick={logout}
            className="w-full mt-2 flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
