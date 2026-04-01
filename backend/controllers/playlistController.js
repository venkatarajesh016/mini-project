import { getPlaylists, getPlaylistById } from '../services/jioSaavnService.js';
import { writeFileSync } from 'fs';

const log = (msg) => {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  console.log(line);
  try {
    writeFileSync('./api-debug.log', line, { flag: 'a' });
  } catch (e) { /* ignore */ }
};

export const getAllPlaylists = async (req, res) => {
  try {
    log('[playlistController] getAllPlaylists called');
    log('[playlistController] Starting getPlaylists call...');
    
    const playlists = await getPlaylists();
    
    log(`[playlistController] Received ${playlists.length} playlists`);
    res.json({
      success: true,
      data: playlists,
    });
  } catch (error) {
    log(`[playlistController] ERROR: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch playlists',
      details: error.message,
    });
  }
};

export const getPlaylistDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await getPlaylistById(id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found',
      });
    }

    res.json({
      success: true,
      data: playlist,
    });
  } catch (error) {
    console.error('Error fetching playlist details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch playlist details',
    });
  }
};
