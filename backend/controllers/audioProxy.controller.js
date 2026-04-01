/**
 * Audio Proxy Controller
 * Handles streaming audio from external sources (JioSaavn, etc)
 * Fixes CORS issues by proxying through our backend
 */

import axios from 'axios';

/**
 * GET /proxy-audio
 * Proxy audio stream from external URL
 * Query params: url (encoded URL to stream from)
 */
export const proxyAudio = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Audio URL is required',
      });
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(url);
    
    console.log(`🔊 Proxying audio from: ${decodedUrl}`);

    // Fetch the audio stream with proper headers
    const response = await axios({
      method: 'get',
      url: decodedUrl,
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.jiosaavn.com/',
        'Accept': '*/*',
        'Range': req.headers.range || undefined,
      },
    });

    // Set appropriate headers for audio streaming
    res.set({
      'Content-Type': response.headers['content-type'] || 'audio/mpeg',
      'Content-Length': response.headers['content-length'] || '',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    });

    // If partial content was requested (range header), return 206
    if (req.headers.range) {
      res.status(206);
    }

    // Stream the audio to client
    response.data.pipe(res);

    response.data.on('error', (err) => {
      console.error('❌ Error streaming audio:', err.message);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to stream audio',
          error: err.message,
        });
      }
    });
  } catch (error) {
    console.error('❌ Error in proxyAudio:', error.message);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to proxy audio stream',
        error: error.message,
      });
    }
  }
};

/**
 * POST /validate-audio-url
 * Validate if an audio URL is accessible and returns correct headers
 * Request body: { audioUrl: "https://..." }
 */
export const validateAudioUrl = async (req, res) => {
  try {
    const { audioUrl } = req.body;

    if (!audioUrl) {
      return res.status(400).json({
        success: false,
        isValid: false,
        message: 'Audio URL is required',
      });
    }

    console.log(`✓ Validating audio URL: ${audioUrl}`);

    // Test if URL is accessible
    const headResponse = await axios({
      method: 'head',
      url: audioUrl,
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      maxRedirects: 5,
    }).catch(async (err) => {
      // If HEAD fails, try GET with stream
      if (err.response?.status === 405) {
        return await axios({
          method: 'get',
          url: audioUrl,
          timeout: 5000,
          responseType: 'stream',
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
          maxRedirects: 5,
        });
      }
      throw err;
    });

    const contentType = headResponse.headers['content-type'] || 'audio/mpeg';
    const contentLength = headResponse.headers['content-length'];

    console.log(`✅ Audio URL is valid:`, {
      contentType,
      size: contentLength,
    });

    res.status(200).json({
      success: true,
      isValid: true,
      message: 'Audio URL is accessible',
      contentType,
      contentLength,
    });
  } catch (error) {
    console.error('❌ Audio URL validation failed:', error.message);

    res.status(200).json({
      success: false,
      isValid: false,
      message: 'Audio URL is not accessible',
      error: error.message,
    });
  }
};
