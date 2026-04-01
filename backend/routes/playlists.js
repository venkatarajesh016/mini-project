import express from 'express';
import { getAllPlaylists, getPlaylistDetails } from '../controllers/playlistController.js';

const router = express.Router();

console.log('[playlists.js] Defining routes');

router.get('/', (req, res, next) => {
  console.log('[playlists.js] GET / called');
  getAllPlaylists(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  console.log('[playlists.js] GET /:id called with id:', req.params.id);
  getPlaylistDetails(req, res).catch(next);
});

console.log('[playlists.js] Routes defined');

export default router;
