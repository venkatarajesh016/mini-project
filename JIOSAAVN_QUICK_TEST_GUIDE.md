# Quick Start - Testing JioSaavn Recommendation Fix

## Quick Setup (5 minutes)

### Step 1: Start the Backend
```bash
cd backend
npm install  # Only needed once
npm start
```
You should see the server starting (console may show logs or be silent)

### Step 2: Start the Frontend (New Terminal)
```bash
cd naavix-app/naavix-app-main
npm install  # Only needed once
npm run dev
```
This starts the dev server, usually on `http://localhost:5173`

### Step 3: Start ML Service (Optional, New Terminal)
```bash
cd ml-services
python -m venv venv
# Activate venv based on OS:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

## Testing in Browser (5 minutes)

### Before You Start
- Open DevTools: Press `F12` or Right-click → Inspect
- Go to Console tab
- You'll see log messages here when playing songs

### Step 1: Play a Song
1. Open your app at `http://localhost:5173`
2. Find and play any song from the main list
3. Verify audio plays normally ✓

### Step 2: Get Recommendations
1. While song is playing, look for a "Get Recommendations" or similar button
2. Click it
3. Wait for recommendations to load (watch Console for logs)
4. You should see a list of recommended songs

### Step 3: Play Recommendation (The Big Test!)
1. Click play on any recommended song
2. **Open DevTools Console immediately (F12)**
3. Watch for logs that show:
   ```
   ================================================================================
   ▶️  PLAY RECOMMENDATION: Song Title
   ================================================================================
   ```

### Step 4: Check the Console Logs
Look for these key lines in Console:

```
✅ STEP 1: JIOSAAVN URL DETECTED
   URL: https://www.jiosaavn.com/song/...
```
→ This means URL was detected correctly

```
📤 Calling backend: POST http://localhost:3000/fetch-from-jiosaavvn-url
📥 Backend response status: 200
```
→ This means backend successfully fetched audio

```
✅ STEP 2: AUDIO URL OBTAINED
   Original: https://h.saavncdn.com/...
   Proxied:  http://localhost:3000/proxy-audio?url=...
```
→ This means audio stream was converted to proxied URL

```
✅ FINAL SONG OBJECT: {
  title: "...",
  hasFileUrl: true,
  FileUrl: "http://localhost:3000/proxy-audio?url=..."
}

▶️  CALLING playSong() with the prepared object
```
→ This means song object is ready to play

### Step 5: Verify Audio Plays
- If the steps above show ✅, audio should play
- If no audio: Check Network tab (F12 → Network) for failed requests

## If Something Goes Wrong

### Issue: Recommendations Show But No Audio Plays

**First Check: Console Logs**
```bash
Open F12 → Console
Look for RED ERROR messages
Copy them and check below
```

**Common Issues & Fixes**

1. **Error: "No audio source available"**
   - Cause: ML model doesn't have URL field in training data
   - Fix: Try uploading new songs with external URLs to database

2. **Error: Backend error (0) or connection refused**
   - Cause: Backend not running
   - Fix: Check backend terminal, restart with `npm start`

3. **Error: "Failed to fetch song from JioSaavn"**
   - Cause: JioSaavn page structure changed or blocked
   - Fix: This is a known limitation, try again later (rate limiting)

4. **No logs appearing when playing**
   - Cause: Browser cached old version
   - Fix: Hard refresh: Ctrl+F5 (Cmd+Shift+R on Mac)

5. **Logs show URL detected but then fails**
   - Cause: Backend fetch failed
   - Fix: Check `/fetch-from-jiosaavvn-url` endpoint directly

### Test Individual Endpoints

#### Test 1: Backend Running?
```bash
# Open PowerShell/Terminal and try:
curl http://localhost:3000/getSongs

# Should return a list of songs (might be long)
```

#### Test 2: JioSaavn Fetch Working?
```bash
curl -X POST http://localhost:3000/fetch-from-jiosaavvn-url ^
  -H "Content-Type: application/json" ^
  -d "{\"jiosaavnUrl\":\"https://www.jiosaavn.com/song/pareshanura/BgdaUDMFcnY\"}"

# Should return: {"success":true, "song":{...}}
```

#### Test 3: Proxy Working?
```bash
# Use an actual audio URL from test 2
curl "http://localhost:3000/proxy-audio?url=https%3A%2F%2Fh.saavncdn.com%2F..."

# Should return audio data (binary)
```

## Automated Testing

Run the provided test script:
```bash
# In project root
node test-jiosaavn-flow.js

# Should show test results like:
# ✅ Passed: 4
# ❌ Failed: 0
# 📈 Success Rate: 100%
```

## Performance Expectations

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| Get Recommendations | 1-3 seconds | First call slower, then cached |
| Play JioSaavn Song | 2-5 seconds | Fetches audio stream first time |
| Play Database Song | <1 second | Instant playback |
| Proxy From Server | Depends on ISP | Network dependent |

## Browser DevTools Tips

### To See All Network Requests
1. F12 → Network tab
2. Click on a recommendation
3. Watch requests flow in:
   - `fetch-from-jiosaavvn-url` - Should show 200 status
   - `proxy-audio` - Should show 200 and audio data

### To Check Console Messages
1. F12 → Console tab
2. Filter by clicking the Log icon to see different message types
3. Clear console: Ctrl+L or click clear button

### To Debug Audio Element
```javascript
// Paste in Console:
console.log('Audio src:', document.querySelector('audio')?.src);
console.log('Audio playing:', document.querySelector('audio')?.playing);
```

## Success Indicators ✅

If you see these, the fix is working:

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Can play songs from main list
- [ ] Can fetch recommendations
- [ ] Console shows detection of JioSaavn URLs
- [ ] Backend fetch returns success (200 status)
- [ ] Recommendation plays audio
- [ ] No error messages about "audio source"

## Need More Help?

### Detailed Documentation
- Read: [JIOSAAVN_RECOMMENDATION_FIX_GUIDE.md](./JIOSAAVN_RECOMMENDATION_FIX_GUIDE.md)
- Read: [JIOSAAVN_RECOMMENDATION_FIX_SUMMARY.md](./JIOSAAVN_RECOMMENDATION_FIX_SUMMARY.md)

### Check Console Logs
All debugging information is logged to browser Console
- Look for `▶️` symbols to track flow
- ✅ shows successful steps
- ❌ shows failures
- 📋 shows data structure

### Restart Everything
If stuck, restart all services:
```bash
# Kill all three terminals (Ctrl+C in each)

# In terminal 1:
cd backend && npm start

# In terminal 2:
cd naavix-app/naavix-app-main && npm run dev

# In terminal 3 (if using ML):
cd ml-services && python -m uvicorn app.main:app --port 8000

# In browser:
Hard refresh: Ctrl+F5
```

## Frequently Asked Questions

**Q: Do I need the ML service running?**
A: No, it's optional. Recommendations come from it, but fallback to database exists.

**Q: What if recommendations don't have URLs?**
A: Check ML model training data - it might not have extracted JioSaavn URLs.

**Q: Can I test without JioSaavn?**
A: Yes, upload songs to database and play them directly. The JioSaavn flow is just for recommendations.

**Q: Why is it slow?**
A: First call fetches from JioSaavn's servers (1-3 seconds). Cached after that.

**Q: Does this work on mobile?**
A: Partially - backend proxy works, but depends on mobile app implementation.

## Next Steps

1. **Test everything** using steps above
2. **Check console logs** if anything fails  
3. **Look at detailed guide** if you need deep technical info
4. **You're done!** System should now play JioSaavn recommendations

---

**Expected Result**: 
Click on a recommendation → Player shows loading → Audio plays → Success! 🎉

Good luck!
