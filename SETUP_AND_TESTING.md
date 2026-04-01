# Setup & Testing Guide - JioSaavn Integration

## 🔧 Setup Instructions

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install `axios@^1.6.0` which is required for external API calls.

### Step 2: Configure JioSaavn API Endpoint

1. Open `backend/services/externalSongsService.js`
2. Find the line:
   ```javascript
   const JIOSAAVN_API_BASE = "https://your-vercel-api/api/search/songs";
   ```
3. Replace `https://your-vercel-api` with your actual Vercel API URL or proxy endpoint

**Example:**
```javascript
const JIOSAAVN_API_BASE = "https://jiosaavn-api-vercel.vercel.app/api/search/songs";
```

### Step 3: Start the Backend Server

```bash
# From backend directory
npm run dev
# or
node server.js
```

The server should start on `http://localhost:3000`

### Step 4: Start the Frontend

```bash
# From naavix-app/naavix-app-main directory
npm run dev
```

The frontend should start on `http://localhost:5173` (or similar)

---

## 🧪 Comprehensive Testing Guide

### Test 1: Verify Existing Functionality (No Breakage)

**Objective:** Ensure all local songs still work

**Steps:**
1. Open the app in browser
2. Navigate to Home page
3. Verify you see song cards from your database
4. Click on any song card
5. **Expected:** Song should play, player shows correct title/artist

**Pass Criteria:**
- ✅ Song plays without errors
- ✅ Player controls work (play/pause)
- ✅ Volume control works
- ✅ Progress bar shows song duration

---

### Test 2: Verify Playlist Functionality

**Objective:** Ensure playlists still play multiple songs in order

**Steps:**
1. Navigate to any playlist page
2. Click the "Play" button
3. Listen as the playlist plays songs sequentially
4. Use Next/Previous buttons

**Pass Criteria:**
- ✅ Playlist starts playing from first song
- ✅ Songs play in correct order
- ✅ Next button plays the next song
- ✅ Previous button works correctly

---

### Test 3: Basic External Search

**Objective:** Test that external API integration works

**Steps:**
1. Navigate to Search page
2. Type "Srivalli" in the search box
3. Wait 1-2 seconds for results

**Expected Result:**
```
Search page shows:
├── Local Library
│   └── Any matching local songs
└── Search Results
    └── External songs from JioSaavn
```

**Pass Criteria:**
- ✅ "Search Results" section appears
- ✅ External songs are displayed as cards
- ✅ Each card shows Title, Artist, and Album
- ✅ No console errors

---

### Test 4: Play External Song

**Objective:** Verify external songs can be played

**Steps:**
1. From Search page results, click on an external song
2. Listen to the audio

**Pass Criteria:**
- ✅ Song starts playing
- ✅ Player shows correct title and artist
- ✅ Album art displays (if available)
- ✅ Audio plays without buffering issues

---

### Test 5: Search Caching

**Objective:** Verify caching works and improves performance

**Steps:**
1. Search for "Naatu Naatu"
2. Wait for results to load (note the time)
3. Navigate away (click Home)
4. Return to Search page
5. Search for "Naatu Naatu" again

**Expected:**
- First search: Takes 1-2 seconds
- Second search: Returns instantly from cache

**Pass Criteria:**
- ✅ Second search is noticeably faster
- ✅ Results are identical to first search
- ✅ No API calls on second search (check Network tab)

---

### Test 6: Error Handling - API Failure

**Objective:** Verify graceful error handling

**Steps:**
1. Open DevTools (F12) → Network tab
2. Enable offline mode: 
   - DevTools → Throttling → Offline
3. Go to Search page
4. Search for a song
5. Observe error message
6. Go back online

**Expected:**
- Error message: "External songs unavailable"
- Local Library search still works
- No crash or breaking UI

**Pass Criteria:**
- ✅ Friendly error message shown
- ✅ Local search continues to work
- ✅ UI remains functional
- ✅ No JavaScript errors in console

---

### Test 7: Mixed Library and External Songs

**Objective:** Verify both sources can be used in same session

**Steps:**
1. Play a local song
2. Search and play an external song
3. Search and play another external song
4. Search and play a local song again

**Pass Criteria:**
- ✅ Can seamlessly play between sources
- ✅ Player displays correct song info
- ✅ No conflicts or errors
- ✅ Queue management works correctly

---

### Test 8: Search with Empty Results

**Objective:** Verify UI handles no-results gracefully

**Steps:**
1. Search for something very specific: "xyzabc999impossible"
2. Observe the results

**Expected:**
- Message: 'No results found for "xyzabc999impossible"'
- Suggestion: "Try searching for something else"

**Pass Criteria:**
- ✅ User-friendly message shown
- ✅ No errors
- ✅ Can search again without issues

---

### Test 9: Player Controls with External Songs

**Objective:** Verify all player controls work with external songs

**Steps:**
1. Play an external song
2. Test each control:
   - Play/Pause button
   - Volume slider
   - Progress bar
   - Next button
   - Previous button
   - Queue panel

**Pass Criteria:**
- ✅ Play/Pause works
- ✅ Volume adjusts correctly
- ✅ Progress bar can be dragged
- ✅ Next/Previous navigate properly
- ✅ Queue shows songs correctly

---

### Test 10: Multiple Rapid Searches

**Objective:** Stress test the search functionality

**Steps:**
1. Rapidly search for different songs:
   - "Srivalli"
   - "Naatu"
   - "Buttabomma"
   - "Sundari"
   - "Inkem"
2. Observe performance

**Pass Criteria:**
- ✅ UI remains responsive
- ✅ No crashes
- ✅ Results load correctly for each query
- ✅ Caching works (repeated searches are fast)

---

## 🔍 Debugging Checklist

If something doesn't work, check these:

### Backend Issues:

**Problem:** External songs not loading
```bash
# Check backend is running
curl http://localhost:3000/external-songs?q=Srivalli

# Expected response:
# {
#   "success": true,
#   "query": "Srivalli",
#   "count": 10,
#   "songs": [...]
# }
```

**Problem:** Axios not installed
```bash
# Install it
cd backend
npm install axios
```

**Problem:** API endpoint not configured
- Check `backend/services/externalSongsService.js`
- Verify `JIOSAAVN_API_BASE` URL is correct
- Test URL in browser or Postman

### Frontend Issues:

**Problem:** Search results not appearing
```
Open DevTools → Network tab
1. Search for a song
2. Check if request to `/external-songs` is made
3. Check response status (should be 200)
4. Check response body has "songs" array
```

**Problem:** External songs won't play
```
Check console for error messages:
- "Song does not have a valid audio URL"
  → Song is missing audioUrl field
- "Failed to load audio"
  → Audio URL is invalid or unreachable
```

**Problem:** Cache not working
```
Open DevTools → Application → Storage → Session Storage
1. Search twice for same thing
2. Check if search results are cached
3. Manually clear cache: sessionStorage.clear()
```

### Common Issues:

| Issue | Solution |
|-------|----------|
| No results from search | Check JioSaavn API URL is correct and accessible |
| "CORS error" in console | API endpoint needs CORS enabled or use proxy |
| External songs don't play | Check downloadUrl[4].url exists in API response |
| App crashes on search | Check for console errors, specific error handling in code |
| Slow performance | Cache should improve on repeated searches (500ms debounce) |

---

## 📊 Expected API Response

### When searching for "Srivalli":

**Backend Response Format:**
```json
{
  "success": true,
  "query": "Srivalli",
  "count": 5,
  "songs": [
    {
      "title": "Srivalli",
      "artist": "Sid Sriram",
      "image": "https://..../image.jpg",
      "audioUrl": "https://..../song.mp3",
      "source": "external",
      "_id": "abc123",
      "album": "Pushpa",
      "genre": "Telugu",
      "duration": "240"
    },
    // ... more songs
  ]
}
```

---

## 🎵 Test Queries to Try

These queries should work well with JioSaavn:

1. **Single Words:**
   - "Srivalli"
   - "Naatu"
   - "Buttabomma"
   - "Sundari"

2. **Artist Names:**
   - "Sid Sriram"
   - "Armaan Malik"
   - "Anirudh"

3. **Movie Names:**
   - "Pushpa"
   - "RRR"
   - "Ala Vaikunthapurramuloo"

4. **Album Names:**
   - "Geetha Govindam"
   - "Arjun Reddy"

---

## ✅ Final Verification Checklist

Before considering the integration complete:

- [ ] Backend starts without errors
- [ ] Frontend loads completely
- [ ] Local songs play correctly
- [ ] External search works
- [ ] Can play external songs
- [ ] Caching improves performance
- [ ] Error handling works gracefully
- [ ] No console errors
- [ ] Player controls all work
- [ ] Can mix local and external songs in same session
- [ ] UI remains responsive during searches
- [ ] No database schema changes
- [ ] Existing playlists still work
- [ ] All tests pass without issues

---

## 🚀 You're Ready!

Once all tests pass, the integration is complete and production-ready! 🎉

---

## 📞 Troubleshooting Help

If you encounter issues:

1. **Check Console:**
   - Open DevTools (F12)
   - Look for red errors
   - Note the error message

2. **Check Network:**
   - DevTools → Network tab
   - Repeat the action
   - Check if API calls are being made
   - Check response status (200 = success, 4xx = error)

3. **Check Local Storage:**
   - DevTools → Application → Local/Session Storage
   - Clear cache and try again: `localStorage.clear()`

4. **Check Backend Logs:**
   - Look at terminal where backend is running
   - Should see log messages for each request
   - Check for error messages

5. **Verify Configuration:**
   - Check JioSaavn API URL in `externalSongsService.js`
   - Verify it's accessible (test in browser)
   - Check axios is installed: `npm list axios`

---

Good luck! 🎵✨
