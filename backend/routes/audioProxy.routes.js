/**
 * Audio Proxy Routes
 * Proxies external audio URLs through backend to avoid CORS issues
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * POST /proxy-audio
 * Proxies audio from external URL through backend
 * Body: { audioUrl: "https://..." }
 * Returns: Audio stream with proper CORS headers
 */
router.post('/proxy-audio', async (req, res) => {
  try {
    const { audioUrl } = req.body;

    if (!audioUrl) {
      return res.status(400).json({
        success: false,
        message: 'audioUrl is required',
      });
    }

    console.log(`🎵 Proxying audio from: ${audioUrl.substring(0, 80)}...`);

    // Fetch the audio file from external source
    const response = await axios.get(audioUrl, {
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.jiosaavn.com/',
      },
    });

    // Set CORS and audio headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mp4');
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    console.log('✅ Audio proxy stream started');

    // Pipe the audio stream to response
    response.data.pipe(res);

    response.data.on('error', (error) => {
      console.error('❌ Stream error:', error.message);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to stream audio',
          error: error.message,
        });
      }
    });

  } catch (error) {
    console.error('❌ Error proxying audio:', error.message);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to proxy audio',
        error: error.message,
      });
    }
  }
});

/**
 * GET /proxy-audio?url=<encoded-url>
 * Alternative GET endpoint for proxying audio
 */
router.get('/proxy-audio', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'url query parameter is required',
      });
    }

    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(url);
    console.log(`🎵 Proxying audio (GET): ${decodedUrl.substring(0, 80)}...`);

    // Fetch the audio file from external source
    const response = await axios.get(decodedUrl, {
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.jiosaavn.com/',
      },
    });

    // Set CORS and audio headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mp4');
    
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    console.log('✅ Audio proxy stream started');

    // Pipe the audio stream to response
    response.data.pipe(res);

    response.data.on('error', (error) => {
      console.error('❌ Stream error:', error.message);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to stream audio',
        });
      }
    });

  } catch (error) {
    console.error('❌ Error proxying audio:', error.message);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to proxy audio',
        error: error.message,
      });
    }
  }
});

// Handle OPTIONS requests
router.options('/proxy-audio', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.sendStatus(200);
});

export default router;
