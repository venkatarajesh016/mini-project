import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import songRoutes from './routes/songs.Routes.js';
import albumRoutes from './routes/album.Routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';
import homeRoutes from './routes/home.routes.js';
import playlistRoutes from './routes/playlists.js';
import albumsRoutes from './routes/albums.js';

console.log('[server] Routes imported successfully');
console.log('[server] playlistRoutes:', typeof playlistRoutes, playlistRoutes? 'defined':'undefined');
console.log('[server] albumsRoutes:', typeof albumsRoutes, albumsRoutes? 'defined':'undefined');

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

// CORS configuration for mobile and web clients
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',
    'http://localhost:8082', // Expo web
    'http://localhost:8083',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:8082',
    'http://10.57.42.141:3000', // Your machine WiFi IP (for mobile dev)
    'http://10.57.42.141:8081',
    'http://10.57.42.141:8082',
    'http://10.127.165.141:3000', // Old/fallback IP
    'http://10.127.165.141:8081',
    'http://10.127.165.141:8082',
    'http://192.168.137.242:3000', // Alternative local IP
    'http://192.168.137.242:8081',
    'http://0.0.0.0:3000', // All interfaces
    'http://10.0.2.2:3000', // Android Emulator
    'http://10.0.2.2:8081',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

// Global logging middleware
app.use((req, res, next) => {
  console.log(`[EXPRESS] ${req.method} ${req.path}`);
  next();
});

app.use(songRoutes);
app.use(albumRoutes);
app.use('/api/recommend', recommendationRoutes);
app.use(homeRoutes);

// Test endpoint to verify routing
app.get('/test', (req, res) => {
  console.log('[server] /test endpoint called');
  res.json({ message: 'Test endpoint works' });
});

console.log('[server] About to register /api/playlists route');
app.use('/api/playlists', playlistRoutes);
console.log('[server] Registered /api/playlists route');
app.use('/api/albums', albumsRoutes);
console.log('[server] All routes registered');

// Debug endpoint to check FileUrl and audio file availability
app.get('/debug/songs', async (req, res) => {
  try {
    const Song = (await import('./models/songs.model.js')).default;
    const songs = await Song.find().limit(5);
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    
    const songDebugInfo = await Promise.all(songs.map(async (song) => {
      let fileUrl = song.FileUrl || '';
      // Construct what the URL would be
      let constructedUrl = '';
      if (fileUrl && !fileUrl.startsWith('http')) {
        // Remove leading slashes and uploads/ prefix, then remove leading backslashes
        let cleanPath = fileUrl.replace(/^[\/\\]+uploads[\/\\]+/, '').replace(/^[\/\\]+/, '');
        constructedUrl = `/uploads/${cleanPath}`;
      }
      
      // Check if file exists
      let fileExists = false;
      let filePath = '';
      if (fileUrl && !fileUrl.startsWith('http')) {
        // Try different paths
        const possiblePaths = [
          path.join('uploads', fileUrl.split('/').pop()),
          path.join('uploads', fileUrl),
          fileUrl
        ];
        
        for (const p of possiblePaths) {
          try {
            await fs.access(p);
            fileExists = true;
            filePath = p;
            break;
          } catch (e) {
            // File not found, try next path
          }
        }
      }
      
      return {
        title: song.title,
        storedFileUrl: fileUrl,
        constructedUrl: constructedUrl,
        fileExists: fileExists,
        actualFilePath: filePath,
        fullPlaybackUrl: `http://localhost:3000${constructedUrl}`
      };
    }));
    
    res.json({
      success: true,
      message: 'Debug info for audio files',
      songs: songDebugInfo
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    routes: [
      '/getSongs',
      '/getTopSongs',
      '/external-songs',
      '/trending-telugu-songs',
    ]
  });
});

mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Error connecting to MongoDB:', error));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Accessible from this machine at: http://192.168.137.242:${PORT}`);
});
