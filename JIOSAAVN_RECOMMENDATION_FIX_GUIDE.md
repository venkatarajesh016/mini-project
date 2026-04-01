# JioSaavn Recommendation Audio URL Fix - Implementation Guide

## Problem Resolved
The frontend was attempting to play JioSaavn song page URLs directly (e.g., `https://www.jiosaavn.com/song/pareshanura/BgdaUDMFcnY`) instead of actual audio streams, causing playback failures.

## Solution Architecture

### 1. **Frontend Flow (QueuePanel.tsx)**
When a recommended song is clicked:

```
handlePlayRecommendation(song)
    ↓
Check if song.url contains JioSaavn URL
    ↓ YES
Call Backend POST /fetch-from-jiosaavvn-url
    ↓
Backend returns audioUrl (JioSaavn audio stream)
    ↓
Create Proxied URL: /proxy-audio?url={encoded_audioUrl}
    ↓
Set song.FileUrl and song.audioUrl to proxied URL
    ↓
Call playSong(song)
    ↓ Playback via HTML5 Audio Element
```

### 2. **Backend Flow**

#### Endpoint: `POST /fetch-from-jiosaavvn-url`
- **Location**: `backend/controllers/externalSongs.controller.js` (function: `getJioSaavnSongByUrl`)
- **Imports**: `backend/services/externalSongsService.js` (function: `fetchSongFromJioSaavnUrl`)
- **Route**: `backend/routes/songs.Routes.js` (line 29)
- **Input**: `{ jiosaavnUrl: "https://www.jiosaavn.com/..." }`
- **Output**: 
```json
{
  "success": true,
  "source": "jiosaavn",
  "song": {
    "title": "Song Title",
    "artist": "Artist Name",
    "audioUrl": "https://...mp3_audio_stream...",
    "image": "image_url",
    "duration": "3:45"
  }
}
```

#### Endpoint: `GET /proxy-audio`
- **Location**: `backend/controllers/audioProxy.controller.js`
- **Purpose**: Stream audio from external sources while handling:
  - CORS headers
  - User-Agent spoofing (to bypass JioSaavn restrictions)
  - Referer headers
  - Range requests (for seeking)
- **Usage**: `/proxy-audio?url={encodeURIComponent(audioUrl)}`

### 3. **Player Context Flow (PlayerContext.tsx)**
```
playSong(song)
    ↓
Check if song.FileUrl populated?
    ├─ YES → Use backend URL (localhost:3000/uploads/...)
    └─ NO → Check song.audioUrl
        ├─ YES → Use audioUrl (could be proxy URL or direct URL)
        └─ NO → Error: No audio source
    ↓
Set audio element src to final URL
    ↓
Call audio.play()
```

## Key Components Updated

### 1. **QueuePanel.tsx**
- Enhanced `handlePlayRecommendation()` with:
  - Multi-step logging for debugging
  - Detection of JioSaavn URLs in multiple fields
  - Fallback to backend database search
  - Comprehensive error handling

### 2. **Backend Services**
- `externalSongsService.js`:
  - `fetchSongFromJioSaavnUrl(jiosaavnUrl)`: Extracts song ID, fetches page metadata, extracts audio stream
  - `extractSongIdFromUrl(jiosaavnUrl)`: Parses JioSaavn URLs to extract song ID

- `audioProxy.controller.js`:
  - `proxyAudio()`: Proxies audio streams with proper headers

### 3. **ML Service** (if dataset has URLs)
- Returns recommendations with `url` field
- URLs could include JioSaavn song page links

## Testing & Debugging

### 1. **Browser Console Logs**
When clicking to play a recommendation, you should see logs like:
```
================================================================================
▶️  PLAY RECOMMENDATION: Song Title
================================================================================

📋 SONG DETAILS: {
  title: "Song Title",
  url: "https://www.jiosaavn.com/song/...",
  FileUrl: undefined,
  audioUrl: undefined
}

🎵 STEP 1: JIOSAAVN URL DETECTED
   URL: https://www.jiosaavn.com/song/...
   ACTION: Fetching audio stream from JioSaavn

📤 Calling backend: POST http://localhost:3000/fetch-from-jiosaavvn-url
📥 Backend response status: 200

✅ STEP 2: AUDIO URL OBTAINED
   Original: https://...mp3_audio_stream...
   Proxied:  http://localhost:3000/proxy-audio?url=...
```

### 2. **API Testing - Manual**

**Test 1: Fetch from JioSaavn URL**
```bash
curl -X POST http://localhost:3000/fetch-from-jiosaavvn-url \
  -H "Content-Type: application/json" \
  -d '{"jiosaavnUrl":"https://www.jiosaavn.com/song/pareshanura/BgdaUDMFcnY"}'
```

Expected Response:
```json
{
  "success": true,
  "source": "jiosaavn",
  "message": "Song fetched successfully",
  "song": {
    "title": "Pareshanura",
    "artist": "...",
    "audioUrl": "https://...mp3...",
    "image": "https://...",
    "duration": "3:45"
  }
}
```

**Test 2: Proxy Audio**
```bash
curl "http://localhost:3000/proxy-audio?url=https://...mp3..." \
  -H "Range: bytes=0-1023"
```

### 3. **Checklist for Debugging**

If recommendations still don't play:

- [ ] **Check if URLs are being returned by ML service**
  - In QueuePanel's `fetchRecommendations()`, check console output
  - Look for `hasExternalUrl` in the enrichment summary table

- [ ] **Check if backend endpoint is working**
  - Test `/fetch-from-jiosaavvn-url` with a known JioSaavn URL
  - Verify it returns `audioUrl` field

- [ ] **Check if proxy is working**
  - Test `/proxy-audio?url=...` with a real audio stream URL

- [ ] **Check browser console for errors**
  - Network tab for failed requests
  - Console for JavaScript errors
  - F12 → Network → filter by xhr/fetch

- [ ] **Check backend logs**
  - See what URLs are being extracted
  - Check if external-songs service is working

## Files Modified

1. **`naavix-app/naavix-app-main/src/components/QueuePanel.tsx`**
   - Enhanced `handlePlayRecommendation()` function
   - Added multi-step debugging logs
   - Improved JioSaavn URL detection
   - Added fallback database search

2. **Already Implemented (No Changes Needed)**
   - `backend/controllers/externalSongs.controller.js`: `getJioSaavnSongByUrl()`
   - `backend/services/externalSongsService.js`: `fetchSongFromJioSaavnUrl()`
   - `backend/controllers/audioProxy.controller.js`: `proxyAudio()`
   - `backend/routes/songs.Routes.js`: Route mappings

## Environment Variables Required

In `.env` (frontend):
```
VITE_BACKEND_URL=http://localhost:3000
```

In `.env` (backend):
```
ML_SERVICE_URL=http://localhost:8000  # If using ML service
```

## Known Limitations

1. **JioSaavn Rate Limiting**: If too many requests are made, JioSaavn may temporarily block
   - Solution: Implement request caching
   - Already has: 5-minute cache in recommendationService.js

2. **CORS Issues**: Handled by proxy endpoint
   - User-Agent and Referer headers are spoofed
   - May need updates if JioSaavn changes detection method

3. **Audio Stream Extraction**: Depends on JioSaavn's HTML structure
   - If JioSaavn updates their page structure, extraction may break
   - Would need to update `fetchFromJioSaavnPage()` in externalSongsService.js

## Next Steps

1. **Start the system**:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - ML Service (if available)
   cd ml-services && python -m uvicorn app.main:app --reload --port 8000
   
   # Terminal 3 - Frontend
   cd naavix-app/naavix-app-main && npm run dev
   ```

2. **Test in browser**:
   - Open http://localhost:5173 (or your frontend port)
   - Play a song
   - Click "Get Recommendations"
   - Click a recommendation to play it
   - Open DevTools (F12) Console
   - Check logs for the flow described above

3. **Verify each step**:
   - See logs for JioSaavn URL detection
   - Verify backend fetch succeeds
   - Confirm audio plays

## Troubleshooting

### Symptom: "No audio source available" error
**Cause**: Recommendations don't have `url` field from ML service  
**Fix**: Check if ML model's training data includes JioSaavn URLs

### Symptom: Backend returns 500 error
**Cause**: External-songs service failing to extract audio  
**Fix**: Check if JioSaavn structure has changed, may need to update parsing logic

### Symptom: Audio plays but no sound
**Cause**: Audio URL is invalid or CORS blocked  
**Fix**: Check proxy endpoint is working, verify User-Agent/Referer headers

### Symptom: Very slow recommendation loading
**Cause**: Backend making external requests to JioSaavn  
**Fix**: This is expected on first load, cache kicks in after

## API Response Examples

### Success Response (get JioSaavn audio)
```json
{
  "success": true,
  "source": "jiosaavn",
  "message": "Song fetched successfully",
  "song": {
    "title": "Pareshanura",
    "artist": "Singer Name",
    "image": "https://a10ztimgs.com/...",
    "audioUrl": "https://h.saavncdn.com/...mp3...",
    "album": "Album Name",
    "duration": 225,
    "genre": "Folk",
    "source": "jiosaavn"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Failed to fetch song from JioSaavn",
  "error": "Could not extract audio from page",
  "song": null
}
```

## Additional Resources

- JioSaavn Music Service: https://www.jiosaavn.com
- ML GNN Model: See `ml-services/model/model.ipynb`
- Frontend Components: See `naavix-app/naavix-app-main/src/components/`
- Backend Services: See `backend/services/`
