import express from 'express';
import { getAllAlbums, getAlbumDetails } from '../controllers/albumController.js';

const router = express.Router();

router.get('/', getAllAlbums);
router.get('/:albumName', getAlbumDetails);

export default router;
