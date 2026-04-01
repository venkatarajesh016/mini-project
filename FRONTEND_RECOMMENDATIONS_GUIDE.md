# 🎵 Frontend Recommendation Queue Integration Guide

## Overview

The frontend queue panel is now integrated with the ML recommendation API (`http://localhost:8000`). When a song is playing, the system automatically fetches and displays 8 recommended songs in the queue panel.

## Features

✅ **Auto-Load Recommendations** - Fetches recommendations when a song starts playing  
✅ **Similarity Scores** - Shows how similar each song is to the current track (0-100%)  
✅ **Recommendation Reasons** - Explains why each song is recommended  
✅ **One-Click Queue** - Add recommended songs to your queue with one click  
✅ **Refresh Recommendations** - Get new recommendations anytime  
✅ **Error Handling** - Gracefully handles API failures  

---

## 📁 Files Modified

### 1. **QueuePanel.tsx** (Updated)
**Path:** `src/components/QueuePanel.tsx`

**Changes:**
- Added recommendations section below the queue
- Integrates with ML API (`http://localhost:8000/recommend`)
- Auto-fetches recommendations when current song changes
- Displays similarity scores and recommendation reasons
- "Add to Queue" button for each recommendation
- "Get New Recommendations" refresh button

**Key Props Used:**
- `currentSong` - Current playing song (from PlayerContext)
- `queue` - Current queue (from PlayerContext) 
- `addToQueue` - Function to add songs to queue (from PlayerContext)

### 2. **useRecommendations.ts** (NEW)
**Path:** `src/hooks/useRecommendations.ts`

**Purpose:** Reusable hook for fetching recommendations from the ML API

**Usage:**
```typescript
import { useRecommendations } from '@/hooks/useRecommendations';

const { recommendations, isLoading, error, fetchRecommendations } = useRecommendations();

// Fetch recommendations
await fetchRecommendations({
  title: "Chamka Chamka",
  artist: "Geetha Madhuri",
  top_k: 8
});
```

---

## 🚀 How It Works

### Data Flow

```
User plays a song
         ↓
PlayerContext updates currentSong
         ↓
QueuePanel detects change
         ↓
useEffect triggers fetchRecommendations()
         ↓
POST /recommend API call (ML Service)
         ↓
Recommendations display in queue panel
         ↓
User clicks "+ Add to Queue"
         ↓
Song added to queue using addToQueue()
```

### API Request Format

```typescript
POST http://localhost:8000/recommend
Content-Type: application/json

{
  "title": "Chamka Chamka",
  "artist": "Geetha Madhuri",
  "top_k": 8
}
```

### API Response Format

```typescript
{
  "current_song": {
    "id": "1",
    "title": "Chamka Chamka",
    "singer": "Singer Name",
    "artist": "Artist Name",
    "genre": "Folk",
    "album": "Album Name",
    "year": 2023
  },
  "recommendations": [
    {
      "id": "2",
      "title": "Similar Song",
      "singer": "Singer Name",
      "artist": "Artist Name",
      "genre": "Folk",
      "album": "Album Name",
      "year": 2023,
      "recommendation_reason": "Same genre as Chamka Chamka",
      "similarity_score": 0.95
    },
    // ... more recommendations
  ],
  "count": 8
}
```

---

## 💡 Using the Hook in Other Components

### Example 1: Recommendation Card Component

```typescript
import { useRecommendations } from '@/hooks/useRecommendations';
import { usePlayer } from '@/context/PlayerContext';

const RecommendationCard: React.FC<{ songTitle: string; artist: string }> = ({ songTitle, artist }) => {
  const { recommendations, isLoading, fetchRecommendations } = useRecommendations();
  const { addToQueue } = usePlayer();

  const handleGetRecommendations = async () => {
    await fetchRecommendations({
      title: songTitle,
      artist: artist,
      top_k: 6
    });
  };

  return (
    <div>
      <button onClick={handleGetRecommendations} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Get Recommendations'}
      </button>
      
      <div className="recommendations-list">
        {recommendations.map((song) => (
          <div key={song.id} className="recommendation-item">
            <h3>{song.title}</h3>
            <p>{song.singer}</p>
            <p className="score">Match: {Math.round(song.similarity_score * 100)}%</p>
            <p className="reason">{song.recommendation_reason}</p>
            <button onClick={() => addToQueue(song)}>Add to Queue</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationCard;
```

### Example 2: Recommendations List View

```typescript
import { useRecommendations } from '@/hooks/useRecommendations';

const RecommendationsPage: React.FC = () => {
  const { recommendations, isLoading, error, fetchRecommendations } = useRecommendations();

  useEffect(() => {
    fetchRecommendations({
      title: "Current Song",
      artist: "Current Artist",
      top_k: 20
    });
  }, []);

  return (
    <div className="recommendations-page">
      {error && <div className="error">{error}</div>}
      
      {isLoading && <div className="loading">Fetching recommendations...</div>}
      
      <div className="grid">
        {recommendations.map((song) => (
          <div key={song.id} className="recommendation-card">
            <h4>{song.title}</h4>
            <p>{song.singer}</p>
            <div className="meta">
              <span className="badge">{song.genre}</span>
              <span className="score">{Math.round(song.similarity_score * 100)}%</span>
            </div>
            <p className="reason">{song.recommendation_reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsPage;
```

---

## 🔒 Error Handling

The QueuePanel automatically handles errors:

```typescript
// 1. Song not found
- Returns: "Song not found"
- Status Code: 404
- Display: Error message in queue panel

// 2. API Connection Error
- Returns: "Could not load recommendations"
- Status Code: Connection refused
- Display: Error alert in recommendations section

// 3. Invalid parameters
- Returns: "No songs match this query"
- Status Code: 400
- Display: "No recommendations available"
```

---

## 📊 Similarity Score Interpretation

The `similarity_score` ranges from 0 to 1:

- **0.9 - 1.0**: Extremely similar (same artist/genre/album)
- **0.7 - 0.9**: Very similar (shares multiple attributes)
- **0.5 - 0.7**: Moderately similar (complementary style)
- **0.3 - 0.5**: Somewhat similar (few shared attributes)
- **< 0.3**: Loosely related (different style)

---

## 🎯 Recommendation Reasons

The API provides reasons for each recommendation. Common reasons include:

- "Same singer as [song name]"
- "Same genre as [song name]"
- "Same album as [song name]"
- "Same artist as [song name]"
- "Similar embedding"

This helps users understand why a song is recommended.

---

## 🛠️ Customization

### Change Number of Recommendations

In `QueuePanel.tsx`, modify the `top_k` parameter:

```typescript
// Current: 8 recommendations
await fetchRecommendations({
  title: currentSong.title,
  artist: currentSong.artist,
  top_k: 8  // ← Change this value
});
```

### Fetch by Song ID Instead of Title

```typescript
// Instead of title/artist:
await fetchRecommendations({
  song_id: "123",  // Use database ID
  top_k: 8
});
```

### Disable Auto-Fetch

In `QueuePanel.tsx`, comment out the auto-fetch useEffect:

```typescript
// useEffect(() => {
//   if (currentSong && isQueueOpen) {
//     fetchRecommendations();
//   }
// }, [currentSong?.id, isQueueOpen]);
```

---

## 🧪 Testing the Integration

### Step 1: Start ML Service
```bash
cd ml-services
python -m uvicorn app.main:app --reload --port 8000
```

### Step 2: Start Frontend
```bash
cd naavix-app/naavix-app-main
npm run dev
```

### Step 3: Test in Browser
1. Open the app in browser (usually `http://localhost:5173`)
2. Click the queue button (or press Q)
3. Play a song
4. Queue panel should show recommendations automatically
5. Click "+" to add recommendations to queue

---

## 📝 Backend Integration Notes

**Current Setup:**
- ML Service: `http://localhost:8000`
- Frontend: `http://localhost:5173` (or dev server port)
- Backend (Node.js): `http://localhost:3000` (when started)

**CORS is enabled** on the ML service, allowing cross-origin requests from the frontend.

**No additional backend middleware needed** - Frontend calls ML service directly.

---

## 🐛 Troubleshooting

### Recommendations Not Loading?

**Check 1:** Is ML service running?
```bash
curl http://localhost:8000/
```
Should return: `{"message":"ML Service is ready"}`

**Check 2:** Current song has title and artist?
```typescript
console.log(currentSong); // Check in browser console
```

**Check 3:** Check browser console for errors
- Open DevTools (F12)
- Look for red error messages
- Check Network tab for API calls

### Similarity Scores All 0?

This might indicate the model hasn't been properly trained. Verify:
1. Model weights exist: `ml-services/model/gnn_model.pth`
2. Embeddings exist: `ml-services/model/artifacts.pkl`
3. Model loaded successfully in ML service logs

---

## 🚀 Next Steps

1. **Connect to Backend** - Backend should proxy these API calls
2. **Add Recommendations to Playlist** - Save recommended songs as playlists
3. **User Preferences** - Track which recommendations users accept/reject
4. **Personalization** - Fine-tune model based on user behavior

---

## 📞 Support

For issues with the recommendation system:
1. Check ML service logs: `ml-services/` terminal
2. Check frontend console: Browser DevTools
3. Verify API response: Use Postman or curl
4. Review integration code: See `useRecommendations` hook
