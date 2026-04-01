# System Architecture Diagram

## High-Level System Flow

```
USER CLICKS RECOMMENDATION
        │
        ▼
    ┌─────────────────────────────────────────────────┐
    │         FRONTEND - React Component              │
    │  (naavix-app-main/src/components/QueuePanel)   │
    │                                                 │
    │  handlePlayRecommendation(song)                │
    │  • Receives: {url: "https://jiosaavn.../s"}  │
    │  • Detects: JioSaavn URL                       │
    │  • Decides: Use backend to extract audio       │
    └────────────────┬────────────────────────────────┘
                     │
        POST BACKEND REQUEST
                     │
                     ▼
    ┌─────────────────────────────────────────────────┐
    │         BACKEND - Node.js/Express               │
    │       (/fetch-from-jiosaavvn-url)               │
    │                                                 │
    │  externalSongs.controller.js:                  │
    │  getJioSaavnSongByUrl(req, res)               │
    │  • Extracting song ID from URL                 │
    │  • Calling external service                    │
    │  • [EXTERNAL] Fetching from JioSaavn APIs     │
    │  • Parsing HTML/JSON response                  │
    │  • Catching audio URL                          │
    │  • Returns: {success, song{audioUrl}}         │
    └────────────────┬────────────────────────────────┘
                     │
        BACKEND RESPONSE
                     │
                     ▼
    ┌─────────────────────────────────────────────────┐
    │         FRONTEND - Create Proxy URL             │
    │                                                 │
    │  audioUrl: "https://h.saavncdn.com/abc.mp3"  │
    │           ↓                                    │
    │  Generate proxy URL:                          │
    │  "/proxy-audio?url=https%3A%2F%2Fh.saavncdn" │
    │                                                │
    │  Set song.FileUrl = proxied URL               │
    │  Call playSong(song)                          │
    └────────────────┬────────────────────────────────┘
                     │
        PLAYER CONTEXT REDIRECT
                     │
                     ▼
    ┌─────────────────────────────────────────────────┐
    │     BACKEND PROXY - Express Handler             │
    │        (/proxy-audio?url=)                      │
    │                                                 │
    │  audioProxy.controller.js:                     │
    │  proxyAudio(req, res)                         │
    │  • Decode URL parameter                        │
    │  • Add headers (User-Agent, Referer)          │
    │  • [EXTERNAL] Fetch from CDN URL              │
    │  • Stream audio to browser                     │
    │  • Handle CORS, Range requests                │
    └────────────────┬────────────────────────────────┘
                     │
        AUDIO STREAM RECEIVED
                     │
                     ▼
    ┌─────────────────────────────────────────────────┐
    │      BROWSER - HTML5 Audio Element              │
    │                                                 │
    │  <audio src="http://localhost/proxy-audio?..>" │
    │  • Receives audio stream                        │
    │  • Decodes MP3/etc                             │
    │  • Plays through speakers                       │
    │                                                 │
    │  ✅ MUSIC PLAYS!                               │
    └─────────────────────────────────────────────────┘
```

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React Frontend                                            │ │
│  │                                                            │ │
│  │  QueuePanel Component                                     │ │
│  │  ├─ Recommendations List                                 │ │
│  │  │  └─ Recommended Songs                                │ │
│  │  │     └─ onClick → handlePlayRecommendation()         │ │
│  │  └─ PlayerContext Integration                           │ │
│  │     └─ playSong() → Play on HTML5 Audio                │ │
│  │                                                            │ │
│  │  PlayerContext (Hook)                                    │ │
│  │  ├─ currentSong state                                   │ │
│  │  ├─ isPlaying state                                    │ │
│  │  ├─ audisoRef (HTML5 Audio element)                    │ │
│  │  └─ playSong() - Main playback function                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                       │
│                           │ HTTP Requests                         │
│                           │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                  YOUR BACKEND SERVER                             │
│              (Node.js/npm start on :3000)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  External Songs Service                                   │ │
│  │                                                            │ │
│  │  externalSongs.controller.js                              │ │
│  │  └─ getJioSaavnSongByUrl()                               │ │
│  │     └─ Takes URL in request body                         │ │
│  │     └─ Calls service layer                               │ │
│  │                                                            │ │
│  │  externalSongsService.js                                  │ │
│  │  ├─ fetchSongFromJioSaavnUrl()                           │ │
│  │  │  ├─ extractSongIdFromUrl()                           │ │
│  │  │  │  └─ Parses "https://www.jiosaavn.../ABC123"      │ │
│  │  │  ├─ fetchFromJioSaavnPage()                         │ │
│  │  │  │  └─ Makes HTTP GET to JioSaavn                   │ │
│  │  │  │  └─ Scrapes/parses response                      │ │
│  │  │  └─ Returns normalized song object                   │ │
│  │  └─ Response: {success, song{audioUrl, ..}}            │ │
│  │                                                            │ │
│  │  Audio Proxy Controller                                  │ │
│  │  └─ proxyAudio()                                        │ │
│  │     └─ Query param: ?url={encoded_audio_url}            │ │
│  │     └─ Fetches from CDN with proper headers             │ │
│  │     └─ Streams to browser                               │ │
│  │                                                            │ │
│  │  Express Routes                                          │ │
│  │  ├─ POST /fetch-from-jiosaavvn-url → externalSongs     │ │
│  │  ├─ GET /proxy-audio → proxyAudio                      │ │
│  │  └─ [+ other existing routes]                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                       │
│                           │ CORS headers added                    │
│                           │ User-Agent spoofed                    │
│                           │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │     External Services            │
        │                                  │
        │  JioSaavn CDN                    │
        │  ├─ HTML pages                   │
        │  └─ Audio streams (.mp3)         │
        │                                  │
        │  JioSaavn APIs                   │
        │  └─ Metadata endpoints           │
        └──────────────────────────────────┘
```

## Request/Response Flow

### Request 1: Fetch Audio from JioSaavn URL

```
REQUEST:
┌─────────────────────────────────────────────┐
│ POST /fetch-from-jiosaavvn-url (HTTP/1.1)  │
├─────────────────────────────────────────────┤
│ Content-Type: application/json              │
│                                             │
│ {                                           │
│   "jiosaavnUrl": "https://www.jiosaavn.com/│
│                  song/pareshanura/ABC123"  │
│ }                                           │
└─────────────────────────────────────────────┘
                      │
           Backend Processing
                      │
RESPONSE:
┌──────────────────────────────────────────────┐
│ HTTP 200 OK                                  │
├──────────────────────────────────────────────┤
│ Content-Type: application/json               │
│                                              │
│ {                                            │
│   "success": true,                           │
│   "source": "jiosaavn",                      │
│   "song": {                                  │
│     "title": "Pareshanura",                  │
│     "artist": "Traditional",                 │
│     "image": "https://a10ztimgs.com/...",   │
│     "audioUrl": "https://h.saavncdn.com/    │
│                 music/mp3/abc.mp3",         │
│     "duration": 225,                         │
│     "album": "Album"                         │
│   }                                          │
│ }                                            │
└──────────────────────────────────────────────┘
```

### Request 2: Proxy Audio Stream

```
REQUEST:
┌────────────────────────────────────────────────┐
│ GET /proxy-audio?url=https%3A%2F%2Fh.saavncdn │
│ %2Fmusic%2Fmp3%2Fabc.mp3 (HTTP/1.1)           │
├────────────────────────────────────────────────┤
│ Host: localhost:3000                           │
│ Range: bytes=0-1023 (optional, for seeking)    │
└────────────────────────────────────────────────┘
                      │
      Backend Fetches from CDN URL
                      │
RESPONSE:
┌────────────────────────────────────────────────┐
│ HTTP 200 OK (or 206 Partial Content)           │
├────────────────────────────────────────────────┤
│ Content-Type: audio/mpeg                       │
│ Content-Length: 4567890                        │
│ Accept-Ranges: bytes                           │
│ Access-Control-Allow-Origin: *                 │
│ Cache-Control: public, max-age=3600            │
│                                                │
│ [BINARY AUDIO DATA - MP3 STREAM]               │
│ ID³...♫♫♫... followed by 4.5 MB of MP3 data  │
└────────────────────────────────────────────────┘
```

## Data State Transformation

```
INITIAL STATE (As Received from ML):
┌────────────────────────────┐
│ Song Object                │
├────────────────────────────┤
│ id: 1                      │
│ title: "Pareshanura"       │
│ artist: "Traditional"      │
│ url: "https://www.jiosaavn│  ← PAGE URL (not audio!)
│       .com/song/.../ABC123"│
│ image: "https://..."       │
│ similarity_score: 0.95     │
└────────────────────────────┘


STEP 1: URL DETECTED
┌────────────────────────────┐
│ Detected JioSaavn URL      │
├────────────────────────────┤
│ ✅ jiosaavn.com found      │
│ ✅ /song/ pattern found    │
│ Action: Fetch audio        │
└────────────────────────────┘


STEP 2: BACKEND RESPONSE RECEIVED
┌────────────────────────────┐
│ Backend Response           │
├────────────────────────────┤
│ success: true              │
│ audioUrl: "https://h.     │  ← REAL AUDIO URL
│           saavncdn.../mp3" │
│ image: "..."               │
│ artist: "..."              │
└────────────────────────────┘


STEP 3: CREATE PROXY URL
┌────────────────────────────┐
│ Proxied URL Generated      │
├────────────────────────────┤
│ http://localhost:3000/     │
│ proxy-audio?url=          │
│ https%3A%2F%2Fh.saavn...  │
└────────────────────────────┘


FINAL STATE (Ready for Playback):
┌────────────────────────────┐
│ Song Object - Enhanced     │
├────────────────────────────┤
│ id: 1                      │
│ title: "Pareshanura"       │
│ artist: "Traditional"      │
│ FileUrl: "http://localhost│  ← PROXIED URL
│          :3000/proxy-.../" │
│ audioUrl: "http://localhost"  ← Backup URL
│           :3000/proxy-.../"|
│ image: "https://..."       │
│ similarity_score: 0.95     │
└────────────────────────────┘


PLAYBACK:
┌────────────────────────────┐
│ HTML5 Audio Playback       │
├────────────────────────────┤
│ <audio src=                │
│  "http://localhost:3000/   │
│   proxy-audio?url=..."     │ ← Browser requests this
│  autoplay>                 │
│                            │
│ ✅ Audio plays!            │
└────────────────────────────┘
```

## Error Handling Flow

```
PROBLEM DETECTED
        │
        ▼
    ┌─ Is it a JioSaavn URL? ─┐
    │                         │
    NO                        YES
    │                         │
    ▼                         ▼
Try Database        Call Backend
    │                   │
    │                   └─ Success? ─┐
    │                        │       │
    │                        YES     NO
    │                        │       │
    │                        ▼       ▼
    │                    Extract   Retry?
    │                    Audio      │
    │                    URL        └─ No
    │                        │         │
    │                        ▼         ▼
    │                    Create    Log Error
    │                    Proxy     Show User
    │                    URL       Message
    │                        │
    └────────┬───────────────┘
             │
             ▼
    Have Audio URL?
    ├─ YES → Play
    └─ NO → Show Error
       "No audio available"
```

## Database Integration Points

```
FLOW 1: With Database Songs
┌──────────────┐
│ Local DB     │
│ - FileUrl    │
│ - ImageUrl   │
│ - etc        │
└────────┬─────┘
         │
         ▼
    playSong()
         │
         ▼
    ✅ PLAYS

FLOW 2: With Recommendations (No Match in DB)
┌──────────────────────┐
│ ML Recommendation    │
│ - url: JioSaavn      │
│ - similarity_score   │
└────────┬─────────────┘
         │
         ├─ Check Database
         │   └─ Not found
         │
         ├─ Fetch JioSaavn
         │   └─ Get audio
         │
         ▼
    playSong()
         │
         ▼
    ✅ PLAYS

FLOW 3: Fallback Mechanism
┌──────────────────────┐
│ Recommendation       │
└────────┬─────────────┘
         │
    Try: JioSaavn Fetch
         │
    ├─ Success? → 
    │   ✅ PLAY
    │  
    └─ Failed?
        │
        Try: Database Search
        │
        ├─ Found? →
        │   ✅ PLAY
        │
        └─ Not Found?
            │
            ❌ ERROR
            "No audio available"
```

## Live Console Output Example

```javascript
// When user clicks recommendation:

================================================================================
▶️  PLAY RECOMMENDATION: Pareshanura
================================================================================

📋 SONG DETAILS: {
  title: "Pareshanura",
  artist: "Traditional",
  url: "https://www.jiosaavn.com/song/pareshanura/BgdaUDMFcnY",
  FileUrl: undefined,
  audioUrl: undefined,
  image: "https://a10ztimgs.com/...",
  cover: undefined
}

✅ DETECTED JIOSAAVN URL: https://www.jiosaavn.com/song/pareshanura/BgdaUDMFcnY

🎵 STEP 1: JIOSAAVN URL DETECTED
   URL: https://www.jiosaavn.com/song/pareshanura/BgdaUDMFcnY
   ACTION: Fetching audio stream from JioSaavn

📤 Calling backend: POST http://localhost:3000/fetch-from-jiosaavvn-url
📥 Backend response status: 200

✅ Backend returned: {
  success: true,
  hasSong: true,
  title: "Pareshanura",
  hasAudioUrl: true
}

✅ STEP 2: AUDIO URL OBTAINED
   Original: https://h.saavncdn.com/music/mp3/1a...5z.mp3
   Proxied:  http://localhost:3000/proxy-audio?url=https%3A%2F%2Fh...

✅ FINAL SONG OBJECT: {
  title: "Pareshanura",
  artist: "Traditional",
  hasFileUrl: true,
  hasAudioUrl: false,
  FileUrl: "http://localhost:3000/proxy-audio?url=https%3A%2F%2Fh.saavncdn..."
}

▶️  CALLING playSong() with the prepared object
================================================================================
```

---

This architecture ensures reliable, debuggable audio playback from JioSaavn recommendations through a clean three-layer pipeline.
