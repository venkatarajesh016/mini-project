import express from 'express';
import { getHomePageData } from '../controllers/home.controller.js';

const router = express.Router();

router.get('/api/home', getHomePageData);

export default router;
