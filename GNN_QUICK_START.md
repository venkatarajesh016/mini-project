# 🚀 Quick Start Guide - GNN Music Recommendation

## 5-Minute Setup

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- MongoDB running (or update connection string)

### Step 1: Export Your Trained Model (⭐ IMPORTANT)

In your Jupyter notebook, after training your GNN:

```python
# Add this cell at the end of your notebook

from sys import path
path.append('..')  # Adjust based on your notebook location

from app.export_model import export_model_from_notebook

export_model_from_notebook(
    model_state_dict=model.state_dict(),
    embeddings=embeddings,  # Your computed embeddings
    df=df,                  # Your DataFrame
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
    output_dir="../model"  # Relative to notebook location
)
```

This creates:
- `ml-services/model/gnn_model.pth` (model weights)
- `ml-services/model/artifacts.pkl` (data & embeddings)

### Step 2: Start ML Service

```bash
cd ml-services

# Install dependencies
pip install -r requirements.txt

# Start the service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# You should see:
# ✅ Model artifacts loaded successfully
# Uvicorn running on http://0.0.0.0:8000
```

Test it:
```bash
curl http://localhost:8000/
# Should return: {"status": "healthy", "message": "✅ ML Service is running", ...}
```

### Step 3: Start Backend API

```bash
cd backend

# Install/update dependencies
npm install axios

# Start the server
npm start

# You should see:
# 🚀 Server is running on http://0.0.0.0:3000
```

Test it:
```bash
curl http://localhost:3000/api/recommend/health
# Should return: {"status": "success", "ml_service": {"available": true, ...}}
```

### Step 4: Start Frontend

```bash
cd naavix-app/naavix-app-main

# Create .env.local if it doesn't exist
echo "REACT_APP_API_URL=http://localhost:3000/api" > .env.local

# Install if needed
npm install

# Start development server
npm run dev

# Open http://localhost:5173 (or whatever Vite shows)
```

### Step 5: Test the Integration

1. Open frontend in browser
2. Find any song and click Play
3. Check browser console - you should see:
   - `✅ Got 5 recommendations for song [id]`
4. Look at Queue Panel on the right:
   - Current song showing
   - Recommendations listed below
   - Click any recommendation to add to queue

---

## Common Commands

### Health Checks
```bash
# ML Service
curl http://localhost:8000/

# Backend
curl http://localhost:3000/api/recommend/health

# Get stats
curl http://localhost:3000/api/recommend/stats
```

### Manual Test - Get Recommendations
```bash
# Using a real MongoDB ID (replace with your actual ID)
curl http://localhost:3000/api/recommend/507f1f77bcf86cd799439011?topK=5
```

### Clear Recommendation Cache
```bash
curl -X POST http://localhost:3000/api/recommend/cache/clear
```

---

## Troubleshooting Checklist

### ❌ "Model not found" error
```
✅ Fix: Run the export step in your notebook
   - Check files exist: ml-services/model/gnn_model.pth
   - Check files exist: ml-services/model/artifacts.pkl
```

### ❌ "Cannot connect to ML service"
```
✅ Fix: 
   1. Is ML service running on port 8000?
   2. Try: curl http://localhost:8000/
   3. Check firewall settings
```

### ❌ "ML service unavailable" on frontend
```
✅ Fix:
   1. Make sure backend is running
   2. Make sure ML service is running
   3. Check REACT_APP_API_URL in .env.local
   4. Look at browser Network tab for failed requests
```

### ❌ No recommendations showing
```
✅ Fix:
   1. Open browser DevTools (F12)
   2. Check Console for errors
   3. Check Network tab for API calls
   4. Verify song has a valid _id in database
```

### ❌ Queue not auto-playing
```
✅ Fix:
   1. Check autoplay toggle is ON in Queue Panel
   2. Verify browser allows autoplay
   3. Check audio element is properly connected
```

---

## Next Steps

1. **Customize Queue UI** - Edit `QueuePanel_enhanced.jsx` for your design
2. **Add More Endpoints** - Add to `fetchRecommendations` in PlayerContext
3. **Improve Performance** - Implement pagination for large queues
4. **Add Persistence** - Save queue to localStorage
5. **Deploy** - See [GNN_DEPLOYMENT_GUIDE.md](./GNN_DEPLOYMENT_GUIDE.md)

---

## File Reference

| File | Purpose |
|------|---------|
| `ml-services/app/model_loader.py` | Loads GNN model |
| `ml-services/app/inference.py` | Recommendation logic |
| `ml-services/app/routes.py` | FastAPI endpoints |
| `ml-services/app/export_model.py` | Exports notebook model |
| `backend/services/recommendationService.js` | Calls ML service |
| `backend/controllers/recommendation.controller.js` | Request handlers |
| `backend/routes/recommendation.routes.js` | Express routes |
| `naavix-app/.../PlayerContext_with_queue.jsx` | Queue & recommendations state |
| `naavix-app/.../QueuePanel_enhanced.jsx` | Queue UI component |

---

## Performance Notes

- **Inference time**: < 100ms (pre-computed embeddings)
- **Recommendation cache**: 5 minutes TTL
- **Typical API response**: 50-200ms
- **Model size**: ~50MB (easily runs on laptops)

---

## Support

If something doesn't work:
1. Check console/logs for error messages
2. Verify all three services are running
3. Test each service in isolation with curl
4. See [GNN_DEPLOYMENT_GUIDE.md](./GNN_DEPLOYMENT_GUIDE.md) for detailed docs

Good luck! 🎵
