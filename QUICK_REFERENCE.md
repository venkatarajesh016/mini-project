# Quick Reference - JioSaavn Integration API Guide

## 🔗 Backend Endpoints

### Get Songs from Local Database
```
GET /getSongs
Response: Song[]
```

### Search External API (JioSaavn)
```
GET /external-songs?q=<query>
Query Parameters:
  q (required): Search query (song name, artist, etc.)

Response:
{
  success: boolean,
  query: string,
  count: number,
  songs: NormalizedSong[]
}
```

---

## 📱 Frontend Components

### usePlayer Hook
```typescript
import { usePlayer } from '@/context/PlayerContext';

const { 
  playSong,           // Play a song
  currentSong,        // Currently playing song
  isPlaying,          // Is audio playing?
  queue,              // Upcoming songs
  togglePlay,         // Toggle play/pause
  nextSong,           // Play next
  prevSong,           // Play previous
  setVolume,          // Set volume (0-100)
  setProgress,        // Set playback progress
  addToQueue,         // Add song to queue
  removeFromQueue,    // Remove song from queue
  toggleQueue,        // Show/hide queue panel
  toggleVisualizer,   // Toggle audio visualizer
  playPlaylist        // Play entire playlist
} = usePlayer();

// Usage
playSong(song);      // Plays any song (local or external)
togglePlay();        // Play/pause current song
```

---

## 🎵 Song Data Structures

### Normalized Song (Unified Format)
```typescript
{
  title: string,              // Song title
  artist: string,             // Artist name
  image: string,              // Image URL
  audioUrl: string,           // Audio URL (ready to play)
  source: 'local' | 'external',
  _id: string,                // Unique ID
  album: string,              // Album name
  genre: string,              // Genre
  duration: string            // Duration in seconds
}
```

### Extended Song Interface (Frontend)
```typescript
interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  isLiked?: boolean;
  
  // Local DB fields
  ImageUrl?: string;
  FileUrl?: string;
  
  // Normalized fields
  image?: string;
  audioUrl?: string;
  source?: 'local' | 'external';
  _id?: string;
  genre?: string;
}
```

---

## 🛠️ Key Functions

### Backend - Normalize a Song
```javascript
import { normalizeSong } from '../utils/normalizeSong.js';

// For local database song
const localNormalized = normalizeSong(databaseSong, 'local');

// For external API song
const externalNormalized = normalizeSong(externalSong, 'external');
```

### Backend - Fetch External Songs
```javascript
import { fetchExternalSongs, validateExternalSongs } from '../services/externalSongsService.js';

const songs = await fetchExternalSongs('Srivalli');
const valid = validateExternalSongs(songs);
```

### Frontend - Search External
```typescript
const response = await axios.get('/external-songs', {
  params: { q: 'Srivalli' }
});
const songs = response.data.songs;
```

---

## 🔄 Data Flow Diagram

```
User searches for "Srivalli"
              ↓
Frontend: /external-songs?q=Srivalli
              ↓
Backend: externalSongsService.fetchExternalSongs()
              ↓
JioSaavn API Response
              ↓
Backend: normalizeSong() for each result
              ↓
Frontend receives normalized songs
              ↓
User clicks to play
              ↓
PlayerContext.playSong(song)
              ↓
Checks source and uses correct audioUrl
              ↓
HTML Audio Element plays song
```

---

## 🎯 Playing Different Song Types

### Playing a Local Database Song
```typescript
const song = {
  title: "Srivalli",
  artist: "Sid Sriram",
  FileUrl: "uploads/srivalli.mp3",  // ← Uses FileUrl
  // ...
};

usePlayer().playSong(song);
// Constructs: http://localhost:3000/uploads/srivalli.mp3
```

### Playing an External API Song
```typescript
const song = {
  title: "Srivalli",
  artist: "Sid Sriram",
  audioUrl: "https://..../song.mp3",  // ← Uses audioUrl
  source: "external"
  // ...
};

usePlayer().playSong(song);
// Uses URL as-is: https://..../song.mp3
```

---

## ⚙️ Configuration

### Update JioSaavn API Endpoint
**File:** `backend/services/externalSongsService.js`

```javascript
// Change this line:
const JIOSAAVN_API_BASE = "https://your-vercel-api/api/search/songs";

// To your actual API:
const JIOSAAVN_API_BASE = "https://jiosaavn-api-vercel.vercel.app/api/search/songs";
```

### Adjust Search Debounce
**File:** `src/pages/Search.tsx`

```typescript
// Default: 500ms
// Decrease for faster search: 300
// Increase to reduce API calls: 1000
const debounceTimer = setTimeout(() => {
  if (query.trim()) {
    fetchExternalSongs();
  }
}, 500);  // ← Adjust this value
```

### Adjust API Timeout
**File:** `backend/services/externalSongsService.js`

```javascript
// Default: 10000ms (10 seconds)
const response = await axios.get(JIOSAAVN_API_BASE, {
  params: { query: query.trim() },
  timeout: 10000  // ← Adjust this value
});
```

---

## 📝 Example Requests & Responses

### Request: Search for "Naatu"
```bash
curl "http://localhost:3000/external-songs?q=Naatu"
```

### Response:
```json
{
  "success": true,
  "query": "Naatu",
  "count": 3,
  "songs": [
    {
      "title": "Naatu Naatu",
      "artist": "Rahul Sipligunj",
      "image": "https://c.saavncdn.com/123/Naatu-Naatu-xyz.jpg",
      "audioUrl": "https://aac.saavncdn.com/123/abc.mp3",
      "source": "external",
      "_id": "naatu123",
      "album": "RRR",
      "genre": "Telugu",
      "duration": "267"
    }
  ]
}
```

---

## 🔍 Search Caching Implementation

**File:** `src/pages/Search.tsx`

```typescript
// Caching mechanism
const searchCacheRef = useRef<Record<string, Song[]>>({});

// Check cache
if (searchCacheRef.current[query]) {
  setExternalSongs(searchCacheRef.current[query]);
  return;  // Use cached data, don't fetch
}

// Store in cache
searchCacheRef.current[query] = songs;
```

**Cache Behavior:**
- First search: Fetch from API (1-2 seconds)
- Same search again: Instant from cache
- Different search: Fetch from API

---

## 🐛 Error Codes & Meanings

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Missing query parameter | Add `?q=search-term` to URL |
| 200 (empty array) | API returned no results | Try different search term |
| Network error | API unreachable | Check API URL, CORS settings |
| CORS error | Cross-origin blocked | Use proxy or enable CORS on API |
| Song won't play | Invalid audioUrl | Check URL is accessible |
| Timeout | API too slow | Increase timeout value |

---

## 🚀 Performance Tips

1. **Use Caching:** Already implemented, searches cache results
2. **Debounce Search:** Already implemented at 500ms
3. **Lazy Load Images:** MusicCard component handles this
4. **Optimize API Responses:** Request only necessary fields
5. **Limit Results:** Consider pagination for large result sets
6. **Monitor Network:** Check DevTools Network tab for bottlenecks

---

## 📚 Important Files

| File | Purpose |
|------|---------|
| `backend/services/externalSongsService.js` | Fetch from JioSaavn API |
| `backend/utils/normalizeSong.js` | Normalize songs to unified format |
| `backend/controllers/externalSongs.controller.js` | Handle `/external-songs` endpoint |
| `src/context/PlayerContext.tsx` | Unified player for all sources |
| `src/pages/Search.tsx` | Display search results with caching |
| `src/data/mockData.ts` | Extended Song interface |

---

## 🔐 Security Considerations

1. **API Key:** No API key needed for JioSaavn unofficial API (but may be rate-limited)
2. **CORS:** Use a proxy if direct API calls are blocked
3. **Rate Limiting:** Consider implementing on your backend to prevent abuse
4. **Input Validation:** Search query is validated server-side
5. **URL Safety:** Audio URLs from API are from trusted source

---

## 📞 Quick Help

**Q: External songs aren't appearing?**
A: Check backend is running and `/external-songs?q=test` returns data

**Q: Songs won't play?**
A: Check PlayerContext playSong() is receiving correct audioUrl

**Q: Search is slow?**
A: Check network latency, verify API endpoint is responsive

**Q: Cache not working?**
A: Open DevTools > Application > Storage > Session and verify data

**Q: ERROR: Cannot read property 'FileUrl'?**
A: Ensure song has either FileUrl (local) or audioUrl (external)

---

Great! Now you have a complete reference guide! 📚✨
