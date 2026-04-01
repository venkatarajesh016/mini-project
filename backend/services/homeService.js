import { getPlaylists, getAlbums } from './jioSaavnService.js';

export const generatePlaylists = async () => {
  return await getPlaylists();
};

export const generateAlbums = async () => {
  return await getAlbums();
};
