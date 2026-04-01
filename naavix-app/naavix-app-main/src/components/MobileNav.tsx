import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, User } from 'lucide-react';

const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Library, label: 'Library', path: '/library' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-24 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'scale-110' : ''}`} />
            <span className="text-xs font-medium">{item.label}</span>
            {isActive(item.path) && (
              <div className="w-1 h-1 rounded-full bg-primary absolute -bottom-0.5" />
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
