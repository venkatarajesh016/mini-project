import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PlaylistDetail from './pages/PlaylistDetail';
import AlbumDetail from './pages/AlbumDetail';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/playlist/:id" element={<PlaylistDetail />} />
        <Route path="/album/:id" element={<AlbumDetail />} />
      </Routes>
    </Router>
  );
}
