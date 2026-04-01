# 🎵 GNN-Based Music Recommendation System - Complete Integration Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Setup Instructions](#setup-instructions)
3. [Model Training & Export](#model-training--export)
4. [FastAPI Service](#fastapi-service)
5. [Backend Integration](#backend-integration)
6. [Frontend Integration](#frontend-integration)
7. [Queue Management](#queue-management)
8. [Testing & Troubleshooting](#testing--troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  Player UI      │  │ Queue Panel  │  │ Song Card       │   │
│  └────────┬────────┘  └──────┬───────┘  └────────┬────────┘   │
│           │                   │                   │              │
│           └───────────────────┴───────────────────┘              │
│                         │                                        │
│                    PlayerContext                                 │
└─────────────────────────┬────────────────────────────────────────┘
                         │ axios calls
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js/Express)                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ POST /api/recommend/:id                                    │ │
│  │ GET /api/recommend/health                                  │ │
│  │ POST /api/recommend/batch                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│           │                                                      │
│           └──→ recommendationService.js                          │
│                      │                                           │
│                      └──→ axios → http://localhost:8000/         │
└──────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│             ML SERVICE (FastAPI/Python)                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ GET /              (health check)                          │ │
│  │ POST /recommend    (get recommendations)                   │ │
│  │ POST /recommend/batch                                      │ │
│  │ GET /stats         (model statistics)                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│           │                                                      │
│           └──→ Load Pre-trained GNN Model                        │
│               └──→ Pre-computed Embeddings                       │
│                   └──→ Song Metadata Database                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### 1. Prerequisites
```bash
# Python 3.8+
python --version

# Node.js 16+
node --version

# Install backend dependencies
cd backend
npm install axios

# Install ML service dependencies
cd ml-services
pip install fastapi uvicorn torch torch-geometric pandas scikit-learn numpy joblib
```

### 2. Environment Configuration

**Backend (.env)**
```bash
cd backend
cat > .env << EOF
PORT=3000
MONGODB_URL=mongodb://localhost:27017/spotify
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development
EOF
```

**Frontend (.env)**
```bash
cd naavix-app/naavix-app-main
cat > .env.local << EOF
REACT_APP_API_URL=http://localhost:3000/api
EOF
```

---

## Model Training & Export

### Step 1: Train Model in Notebook

In your Jupyter notebook, after training:

```python
# After you've trained your GNN model, export it:

from app.export_model import export_model_from_notebook

# Assume you have these variables from training:
# - model: MusicGNN instance
# - embeddings: np.ndarray of shape (num_songs, embedding_dim)
# - df: pandas DataFrame with song data
# - song_to_id, id_to_song: mappings
# - encoders: dict of sklearn encoders
# - scaler: StandardScaler instance

export_model_from_notebook(
    model_state_dict=model.state_dict(),
    embeddings=embeddings,
    df=df,
    song_to_id=song_to_id,
    id_to_song=id_to_song,
    encoders={
        "singer": singer_encoder,
        "artist": artist_encoder,
        "album": album_encoder,
        "genre": genre_encoder
    },
    scaler=scaler,
    input_dim=x.shape[1],
    output_dir="model"  # ml-services/model
)
```

This creates two files:
- `ml-services/model/gnn_model.pth` - PyTorch model weights
- `ml-services/model/artifacts.pkl` - Embeddings, data, and metadata

---

## FastAPI Service

### Starting the ML Service

```bash
cd ml-services

# Start using uvicorn
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Or run directly
python app/main.py
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started server process [1234]
✅ Model loaded successfully. Dataset size: 5000 songs
```

### API Endpoints

#### Health Check
```bash
curl http://localhost:8000/

# Response:
{
  "status": "healthy",
  "message": "✅ ML Service is running",
  "model_loaded": true
}
```

#### Get Recommendations
```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "song_id": "123",
    "title": "Chamka Chamka",
    "artist": "Singer Name",
    "top_k": 5
  }'

# Response:
{
  "current_song": {
    "id": 0,
    "title": "Chamka Chamka",
    "singer": "Singer Name",
    "artist": "Artist Name",
    "genre": "Pop",
    "album": "Album Name",
    "year": 2020
  },
  "recommendations": [
    {
      "id": 1,
      "title": "Another Song",
      "singer": "Same Singer",
      "recommendation_reason": "Same Singer",
      "similarity_score": 0.92
    },
    // ... more recommendations
  ],
  "count": 5
}
```

#### Model Statistics
```bash
curl http://localhost:8000/stats

# Response:
{
  "total_songs": 5000,
  "unique_singers": 150,
  "unique_artists": 200,
  "unique_genres": 20,
  "embedding_dimension": 64,
  "model_status": "loaded"
}
```

---

## Backend Integration

### Backend File Structure

```
backend/
├── controllers/
│   └── recommendation.controller.js     # (NEW) Recommendation logic
├── routes/
│   └── recommendation.routes.js         # (NEW) API routes
├── services/
│   └── recommendationService.js         # (NEW) ML service client
├── server.js                            # (UPDATED) Added recommendation routes
└── package.json                         # (UPDATE) Add axios if needed
```

### Integration Steps

1. **Update server.js** (Already done)

2. **Install dependencies**
```bash
cd backend
npm install axios  # If not already installed
```

3. **Verify Routes** in `server.js`
```javascript
import recommendationRoutes from './routes/recommendation.routes.js';
app.use('/api/recommend', recommendationRoutes);
```

### Testing Backend Endpoints

```bash
# Health check
curl http://localhost:3000/api/recommend/health

# Get recommendations for a song
curl http://localhost:3000/api/recommend/507f1f77bcf86cd799439011

# Batch recommendations
curl -X POST http://localhost:3000/api/recommend/batch \
  -H "Content-Type: application/json" \
  -d '{
    "songIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "topK": 5
  }'
```

---

## Frontend Integration

### Setup Files

1. **PlayerContext with Queue** 
   - Location: `naavix-app/naavix-app-main/src/context/PlayerContext_with_queue.jsx`
   - Features: Queue management, autoplay, recommendations fetching

2. **Queue Panel Component**
   - Location: `naavix-app/naavix-app-main/src/components/QueuePanel_enhanced.jsx`
   - Features: Visual queue display, recommendation list, drag-and-drop

3. **Styles**
   - Location: `naavix-app/naavix-app-main/src/styles/QueuePanel_enhanced.css`
   - Features: Modern dark theme styling

### Integration in App.tsx

```typescript
import { PlayerProvider } from './context/PlayerContext_with_queue';
import QueuePanel from './components/QueuePanel_enhanced';

function App() {
  return (
    <PlayerProvider>
      <div className="app-container">
        <MainPlayer />
        <QueuePanel isOpen={true} />
      </div>
    </PlayerProvider>
  );
}

export default App;
```

### Using Player Context in Components

```typescript
import { usePlayer } from '../context/PlayerContext_with_queue';

function SongCard({ song }) {
  const { playSong, addToQueue } = usePlayer();

  const handlePlay = () => {
    playSong(song);
  };

  const handleQueue = () => {
    addToQueue(song);
  };

  return (
    <div className="song-card">
      <img src={song.image} alt={song.title} />
      <h3>{song.title}</h3>
      <p>{song.artist}</p>
      <button onClick={handlePlay}>▶ Play</button>
      <button onClick={handleQueue}>+ Queue</button>
    </div>
  );
}
```

---

## Queue Management

### Queue Logic Flow

```
User plays a song
      ↓
1. Song added to queue at current index
2. PlayerContext fetches recommendations
3. Recommendations displayed in Queue Panel
4. User can add individual recommendations to queue
      ↓
When song ends (if autoplay enabled)
      ↓
1. Next song in queue plays
2. If at end of queue, recommendations auto-add to queue
3. Auto-play resumes
      ↓
If user manually selects song
      ↓
1. Current song moves to history
2. Selected song becomes current
3. New recommendations fetched
```

### Example: Playing a Song

```typescript
// In a component
import { usePlayer } from '../context/PlayerContext_with_queue';

function MusicPlayer() {
  const {
    currentSong,
    queue,
    isPlaying,
    playSong,
    playNext,
    playPrevious,
    togglePlayPause,
    addToQueue,
    recommendations,
    appendRecommendationsToQueue
  } = usePlayer();

  return (
    <div className="player">
      {/* Current Song Display */}
      {currentSong && (
        <div className="now-playing">
          <img src={currentSong.image} alt={currentSong.title} />
          <h2>{currentSong.title}</h2>
          <p>{currentSong.artist}</p>
        </div>
      )}

      {/* Player Controls */}
      <div className="controls">
        <button onClick={playPrevious}>⏮ Previous</button>
        <button onClick={togglePlayPause}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={playNext}>Next ⏭</button>
      </div>

      {/* Add Recommendations to Queue */}
      {recommendations.length > 0 && (
        <div className="quick-add">
          <button onClick={() => appendRecommendationsToQueue(recommendations)}>
            Add All Recommendations to Queue
          </button>
        </div>
      )}

      {/* Queue Display */}
      <div className="queue">
        {queue.map((song, idx) => (
          <div
            key={song._id}
            onClick={() => playSong(song, idx)}
            className={idx === currentSong._id ? 'current' : ''}
          >
            {song.title} - {song.artist}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Testing & Troubleshooting

### Testing the Full Flow

1. **Start all services**
   ```bash
   # Terminal 1: ML Service
   cd ml-services
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

   # Terminal 2: Backend
   cd backend
   npm start

   # Terminal 3: Frontend
   cd naavix-app/naavix-app-main
   npm run dev
   ```

2. **Test chain**
   ```bash
   # Check ML service
   curl http://localhost:8000/

   # Check backend
   curl http://localhost:3000/api/recommend/health

   # Get recommendations
   curl http://localhost:3000/api/recommend/507f1f77bcf86cd799439011
   ```

### Common Issues

#### ML Service Won't Start
```
Error: Model not found in model/ directory

Solution:
1. Ensure you've trained and exported the model:
   - python app/export_model.py
   - Check ml-services/model/gnn_model.pth exists
   - Check ml-services/model/artifacts.pkl exists
```

#### Backend Can't Connect to ML Service
```
Error: HTTPException 503 - ML service unavailable

Solution:
1. Verify ML service is running on port 8000
2. Check ML_SERVICE_URL in backend .env
3. Check firewall/network connectivity
4. Use: curl http://localhost:8000/ to test
```

#### Recommendations Not Showing
```
Error: Frontend not fetching recommendations

Solution:
1. Check browser console for errors
2. Verify REACT_APP_API_URL in .env.local
3. Check CORS settings in backend (should accept *)
4. Verify song_id is being passed correctly
```

#### Queue Not Auto-Playing
```
Error: Next song not playing automatically

Solution:
1. Ensure autoplayEnabled is true
2. Check PlayerContext is wrapping app
3. Verify audio element is properly connected
4. Check browser autoplay permissions
```

---

## Performance Optimization

### Caching Strategy
```typescript
// Recommendations are cached for 5 minutes
// Clear cache if dataset updates:
curl -X POST http://localhost:3000/api/recommend/cache/clear
```

### Batch Processing
```typescript
// Get recommendations for multiple songs at once
async function getMultipleRecommendations(songIds) {
  const response = await axios.post(`${API_BASE_URL}/recommend/batch`, {
    songIds,
    topK: 5
  });
  return response.data;
}
```

### Model Optimization
- Embeddings are pre-computed (no inference overhead)
- Cosine similarity is O(n) where n = number of songs
- Typical response time: < 100ms for single recommendation

---

## Deployment Notes

### Production Checklist

- [ ] Update CORS origins in backend (don't use *)
- [ ] Set ML_SERVICE_URL to production IP/domain
- [ ] Update REACT_APP_API_URL to production URL
- [ ] Add authentication to /api/recommend endpoints
- [ ] Set up monitoring/logging
- [ ] Use PM2 or Gunicorn for process management
- [ ] Configure nginx reverse proxy
- [ ] Enable HTTPS
- [ ] Set up database backups

### Docker Example

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# ML Service Dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

---

## Support

For detailed information, see:
- FastAPI docs: http://localhost:8000/docs
- Recommendation service: recommendationService.js
- Player implementation: PlayerContext_with_queue.jsx
- ML model logic: model_loader.py, inference.py

