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
  let upstreamResponse;
  let streamCompleted = false;

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
    upstreamResponse = await axios.get(decodedUrl, {
      responseType: 'stream',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.jiosaavn.com/',
        'Accept': '*/*',
        ...(req.headers.range ? { Range: req.headers.range } : {}),
      },
    });

    // Preserve the upstream range response so browser seeking and buffering work.
    res.status(upstreamResponse.status);
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Accept-Ranges': upstreamResponse.headers['accept-ranges'] || 'bytes',
      'Content-Type': upstreamResponse.headers['content-type'] || 'audio/mp4',
      ...(upstreamResponse.headers['content-length']
        ? { 'Content-Length': upstreamResponse.headers['content-length'] }
        : {}),
      ...(upstreamResponse.headers['content-range']
        ? { 'Content-Range': upstreamResponse.headers['content-range'] }
        : {}),
    });

    console.log('✅ Audio proxy stream started', {
      status: upstreamResponse.status,
      range: req.headers.range || 'none',
      contentLength: upstreamResponse.headers['content-length'] || 'unknown',
      contentRange: upstreamResponse.headers['content-range'] || 'none',
    });

    // Pipe the audio stream to response
    upstreamResponse.data.pipe(res);

    upstreamResponse.data.on('error', (error) => {
      // Browsers commonly close an old range request while buffering or seeking.
      if (req.aborted || res.destroyed) {
        return;
      }

      console.error('❌ Upstream stream error:', {
        message: error.message,
        code: error.code,
        range: req.headers.range || 'none',
        clientAborted: req.aborted,
        responseDestroyed: res.destroyed,
      });
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to stream audio',
        });
      }
    });

    upstreamResponse.data.on('end', () => {
      streamCompleted = true;
    });

    res.on('finish', () => {
      streamCompleted = true;
    });

    res.on('close', () => {
      if (!streamCompleted && !upstreamResponse.data.destroyed) {
        upstreamResponse.data.destroy();
      }
    });

  } catch (error) {
    console.error('❌ Error proxying audio:', error.message);

    if (upstreamResponse?.data) {
      upstreamResponse.data.destroy();
    }
    
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
