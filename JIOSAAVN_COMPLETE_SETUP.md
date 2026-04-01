# 🎵 Complete JioSaavn Integration Setup Guide

## 📍 Project Status

Your complete music streaming setup is ready with:

1. ✅ **Music App** - `c:\Users\hp\OneDrive\Desktop\mini project\spotify`
2. ✅ **JioSaavn API** - `c:\Users\hp\OneDrive\Desktop\jiosaavn-api`

---

## 🔧 Step 1: Deploy JioSaavn API to Vercel

### Option A: Quick Interactive Deployment (Recommended)

```bash
cd c:\Users\hp\OneDrive\Desktop\jiosaavn-api
npx vercel
```

**Follow prompts:**
- Sign in to Vercel (create account at https://vercel.com if needed)
- Name your project (e.g., "jiosaavn-api")
- Accept defaults for other options
- Wait for deployment to complete

**You'll get a URL like:**
```
https://jiosaavn-api-abc123.vercel.app
```

### Option B: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import from Git (connect your GitHub)
3. Select the `jiosaavn-api` repository
4. Click Deploy

### Option C: Using Vercel CLI with Token

```bash
# Create token at: https://vercel.com/account/tokens
npx vercel --token YOUR_VERCEL_TOKEN
```

---

## 🎯 Step 2: Get Your API URL

After deployment, you'll see:
```
✓ Deployed to production
✓ https://jiosaavn-api-abc123.vercel.app [in 45s]
```

**Copy this URL** - you'll need it next.

---

## 🔌 Step 3: Connect Music App to JioSaavn API

### Update Backend Configuration

**File:** `c:\Users\hp\OneDrive\Desktop\mini project\spotify\backend\services\externalSongsService.js`

Replace line with your Vercel URL:
```javascript
const JIOSAAVN_API_URL = "https://jiosaavn-api-abc123.vercel.app/api/search/songs";
```

### Option: Use Environment Variables (Better)

**Create `.env` in backend folder:**
```bash
# backend/.env
JIOSAAVN_API_URL=https://jiosaavn-api-abc123.vercel.app/api/search/songs
PORT=3000
MONGODB_URL=your_mongodb_url
```

**Update service to use it:**
```bash
# Already done in externalSongsService.js:
const JIOSAAVN_API_URL = process.env.JIOSAAVN_API_URL || "default-url";
```

---

## ✅ Step 4: Verify Everything Works

### 4A: Test JioSaavn API

Open in browser or use curl:
```bash
curl "https://jiosaavn-api-abc123.vercel.app/api/search/songs?query=Srivalli"
```

**Expected:** JSON with song results

### 4B: Test Music App Backend

```bash
cd c:\Users\hp\OneDrive\Desktop\mini project\spotify\backend
npm install  # if not done
node server.js
```

Visit in browser:
```
http://localhost:3000/external-songs?q=Srivalli
```

**Expected:** Normalized songs array

### 4C: Test in Frontend

```bash
cd c:\Users\hp\OneDrive\Desktop\mini project\spotify\naavix-app\naavix-app-main
npm run dev
```

Go to Search page → Search "Srivalli" → See results!

---

## 📊 Complete Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React TypeScript)             │
│              localhost:5173/search                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Search.tsx                                          │   │
│  │ - Local search: /getSongs                           │   │
│  │ - External search: /external-songs?q=...            │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                 BACKEND (Node.js Express)                  │
│               localhost:3000                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Routes:                                              │  │
│  │ • GET /getSongs → MongoDB (local songs)             │  │
│  │ • GET /external-songs → JioSaavn API                │  │
│  └──────────────────────────────────┬───────────────────┘  │
│                                      │                     │
│  ┌──────────────────────────────────▼───────────────────┐  │
│  │ externalSongsService.js                              │  │
│  │ Fetches: https://jiosaavn-api-xxx.vercel.app/...    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│            JioSaavn API (Vercel Deployment)                │
│      https://jiosaavn-api-abc123.vercel.app                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ GET /api/search/songs?query=...                     │  │
│  │ Returns:                                             │  │
│  │ {                                                    │  │
│  │   name: "Srivalli",                                 │  │
│  │   primaryArtists: "Sid Sriram",                     │  │
│  │   image: [...],                                     │  │
│  │   downloadUrl: [...]  ← index 4 is 320kbps         │  │
│  │ }                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎵 Data Flow Example

**User searches "Srivalli" in your app:**

1. Frontend sends: `GET http://localhost:3000/external-songs?q=Srivalli`

2. Backend receives and calls:
   ```javascript
   axios.get('https://jiosaavn-api-abc123.vercel.app/api/search/songs', {
     params: { query: 'Srivalli' }
   })
   ```

3. JioSaavn API returns songs with fields:
   ```javascript
   {
     name: "Srivalli",
     primaryArtists: "Sid Sriram",
     image: [0, 1, 2, 3, 4],     // Use index 2 or 4
     downloadUrl: [0, 1, 2, 3, 4] // Use index 4 (320kbps)
   }
   ```

4. Backend normalizes:
   ```javascript
   {
     title: "Srivalli",
     artist: "Sid Sriram",
     image: song.image[2].url,           // 150x150
     audioUrl: song.downloadUrl[4].url,  // 320kbps
     source: "external"
   }
   ```

5. Frontend displays in Search Results

6. User clicks to play → Player uses `audioUrl`

---

## 🚀 Quick Start Commands

### Terminal 1: Start Backend
```bash
cd c:\Users\hp\OneDrive\Desktop\mini project\spotify\backend
npm install
node server.js
# or: npm run dev (if you have nodemon configured)
```

### Terminal 2: Start Frontend
```bash
cd c:\Users\hp\OneDrive\Desktop\mini project\spotify\naavix-app\naavix-app-main
npm run dev
```

### Terminal 3: Build JioSaavn (optional, only if modifying)
```bash
cd c:\Users\hp\OneDrive\Desktop\jiosaavn-api
npm run build
```

---

## ✨ Testing Checklist

- [ ] JioSaavn API deployed to Vercel and has a URL
- [ ] Backend updated with Vercel URL
- [ ] Backend server running at `http://localhost:3000`
- [ ] Frontend running at `http://localhost:5173`
- [ ] Can search local songs from MongoDB
- [ ] Can search external songs from JioSaavn
- [ ] Can play both local and external songs
- [ ] Player shows correct song info
- [ ] Search results are cached (second search is instant)
- [ ] Error message shows if API fails

---

## 📝 Configuration Files Created/Modified

### New Files:
- ✅ `/jiosaavn-api/DEPLOYMENT_GUIDE.md` - Deployment instructions

### Modified Files:
- ✅ `backend/services/externalSongsService.js` - Now uses env variable
- ✅ Original integration files (from previous step)

### Environment Setup:
Create `.env` file in backend folder:
```bash
# backend/.env
JIOSAAVN_API_URL=https://jiosaavn-api-YOUR-PROJECT-ID.vercel.app/api/search/songs
PORT=3000
MONGODB_URL=your_mongodb_connection_string
```

> **Note:** Add `.env` to `.gitignore` to keep secrets safe

---

## 🔒 Production Considerations

### Before Going Live:

1. **Rate Limiting:**
   ```javascript
   // Add rate limiting middleware
   npm install express-rate-limit
   ```

2. **Error Handling:**
   - Already implemented in backend
   - Frontend shows "External songs unavailable" gracefully

3. **CORS:**
   - JioSaavn API has CORS enabled
   - Your backend already handles it

4. **Caching:**
   - Frontend caches results (500ms debounce)
   - JioSaavn API caches responses (300s)

5. **Monitoring:**
   - Check Vercel dashboard for API errors
   - Log requests in your backend
   - Monitor network requests in browser DevTools

---

## 🛠️ Customization Options

### Change Search Debounce
**File:** `src/pages/Search.tsx`
```typescript
// Current: 500ms
// Adjust for your preference:
setTimeout(() => {
  fetchExternalSongs();
}, 500);  // ← Change this value
```

### Change Audio Quality
**File:** `backend/utils/normalizeSong.js`
```javascript
// Current: downloadUrl[4] (320kbps)
// Options:
// [0] = 12Kbps
// [1] = 48Kbps (very low)
// [2] = 96Kbps (low)
// [3] = 160Kbps (high)
// [4] = 320Kbps (very high) ← Current
```

### Add Pagination
Modify `externalSongsService.js` to handle limit/offset:
```javascript
export const fetchExternalSongs = async (query, limit = 10) => {
  // Add pagination logic
};
```

---

## 📞 Troubleshooting

### Issue: "External songs unavailable"
**Check:**
1. Vercel API URL is correct
2. Vercel deployment is still running
3. Network is working
4. API endpoint format: `https://jiosaavn-api-xxx.vercel.app/api/search/songs`

### Issue: Search results won't display
**Check:**
1. Backend service has correct URL
2. Backend is running: `http://localhost:3000`
3. Browser DevTools Network tab shows request to `/external-songs`
4. Response has `songs` array

### Issue: Songs won't play
**Check:**
1. `audioUrl` field is populated in normalized song
2. Audio URL is accessible (not CORS-blocked)
3. Browser console for errors
4. Try direct URL in `<audio>` tag

---

## 🎯 Next Steps

1. **Deploy JioSaavn API** - Use `npx vercel` in jiosaavn-api folder
2. **Get the URL** - Copy the Vercel deployment URL
3. **Update Backend** - Edit `externalSongsService.js` with your URL
4. **Test Thoroughly** - Use the checklist above
5. **Monitor Logs** - Check Vercel and backend logs for errors
6. **Deploy Your App** - Once tested, deploy your music app to production

---

## 📚 Documentation Files

- 📄 [Integration Summary](../mini%20project/spotify/INTEGRATION_SUMMARY.md)
- 📄 [Setup & Testing Guide](../mini%20project/spotify/SETUP_AND_TESTING.md)
- 📄 [Quick Reference](../mini%20project/spotify/QUICK_REFERENCE.md)
- 📄 [Vercel Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

## ✅ You're All Set!

Your MERN music app now has:
- ✨ Local MongoDB songs
- ✨ External JioSaavn songs
- ✨ Unified player
- ✨ Smart caching
- ✨ Error handling
- ✨ Production-ready API

**Happy coding!** 🚀🎵
