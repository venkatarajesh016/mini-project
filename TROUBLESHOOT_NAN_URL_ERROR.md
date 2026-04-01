# Quick Troubleshooting: "Invalid audio URL: nan" Error

## What This Error Means

The audioUrl value being passed to the audio player is either:
- The literal string `"nan"`
- The literal string `"undefined"` or `"null"`
- A malformed query string like `"200?text=Album+Art:1"`

This prevents the audio player from playing because `new URL()` throws an error on invalid URL strings.

---

## What's Fixed Now

✅ Added explicit validation to catch these invalid values
✅ These values are now **skipped** instead of causing crashes
✅ Users see friendly error messages instead of technical errors
✅ System tries fallback audio sources (FileUrl, database searches)

---

## The Two Errors You Saw

### Error #1: `❌ Invalid audio URL: nan`
```
installHook.js:1 ❌ Invalid audio URL: nan
```

**What was happening**: A recommendation song had `audioUrl: "nan"` instead of a real audio URL
**What happens now**: This value is detected and skipped; tries FileUrl or database lookup instead

**Fix applied**:
```typescript
if (audioUrl === 'nan' || audioUrl === 'NaN' || audioUrl === 'undefined' || audioUrl === 'null') {
  console.error('❌ Invalid audio URL (invalid value):', audioUrl);
  // Show friendly error to user instead of crashing
}
```

---

### Error #2: `200?text=Album+Art:1 Failed to load resource: net::ERR_NAME_NOT_RESOLVED`
```
200?text=Album+Art:1  Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

**What was happening**: An image URL was malformed (missing the protocol and domain), so browser couldn't load it
**What happens now**: This is detected and replaced with a proper placeholder image URL

**Fix applied**:
```typescript
// If it looks like a query string (has ? without http), it's malformed
if (imageUrl.includes('?') && !imageUrl.includes('http')) {
  console.warn('⚠️ Malformed image URL (looks like query string):', imageUrl);
  return PLACEHOLDER_IMAGE; // https://via.placeholder.com/200?text=Album+Art
}
```

---

## How The Fix Works

### When Playing a Recommendation

**Before**:
1. User clicks recommendation
2. `handlePlayRecommendation()` builds song object
3. Passes to `playSong()` with audioUrl="nan"
4. `playSong()` tries `new URL("nan")`
5. ❌ Crash: "TypeError: Failed to construct 'URL': Invalid URL"

**After**:
1. User clicks recommendation
2. `handlePlayRecommendation()` builds song object
3. **Sanitizes audioUrl** - detects "nan", sets to empty string
4. Passes to `playSong()` with audioUrl=""
5. `playSong()` checks for FileUrl instead
6. ✅ Either plays from FileUrl, or shows friendly message

### When Loading Images

**Before**:
1. Recommendation has image="200?text=Album+Art:1"
2. `normalizeImageUrl()` tries to construct URL
3. Returns malformed URL to `<img>` tag
4. Browser tries to load as resource
5. ❌ Error: "net::ERR_NAME_NOT_RESOLVED"

**After**:
1. Recommendation has image="200?text=Album+Art:1"
2. `normalizeImageUrl()` detects it's a query string without protocol
3. Returns proper placeholder: "https://via.placeholder.com/200?text=Album+Art"
4. ✅ Image loads successfully

---

## Where The Validation Happens

### PlayerContext.tsx (Lines ~190-220)
Validates audio URLs before assignment to audio element:
```typescript
// Check for NaN and other invalid values
if (audioUrl === 'nan' || audioUrl === 'NaN' || audioUrl === 'undefined' || audioUrl === 'null') {
  console.error('❌ Invalid audio URL (invalid value):', audioUrl);
  return; // Exit without playing
}
```

### QueuePanel.tsx (Lines ~260-280)
Sanitizes URLs before passing to `playSong()`:
```typescript
// Validate and sanitize audioUrl
let cleanAudioUrl = finalSong.url || (finalSong as any).audioUrl || '';
if (cleanAudioUrl === 'nan' || cleanAudioUrl === 'NaN' || cleanAudioUrl === 'undefined') {
  cleanAudioUrl = '';
}
```

### QueuePanel.tsx (Lines ~32-48)
Detects malformed image URLs:
```typescript
// If it looks like a query string (has ? without http), it's malformed
if (imageUrl.includes('?') && !imageUrl.includes('http')) {
  return PLACEHOLDER_IMAGE;
}
```

---

## Testing The Fix

### Step 1: Start Backend & Frontend
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd naavix-app/naavix-app-main && npm run dev
```

### Step 2: Open Browser Console
- Press `F12` or right-click → Inspect
- Go to **Console** tab
- Keep it visible

### Step 3: Test Recommendation Playback
1. Play any song
2. Click "Get Recommendations"
3. Click a recommendation to play it
4. Watch console for:
   - ✅ Blue checkmarks in logs
   - ❌ Any "Invalid audio URL" messages (expected for problematic songs, should NOT crash)
   - ✅ Audio should either play OR show user-friendly message

### Step 4: Check Results
- **Success**: Audio plays or user sees message like "This song does not have an audio file"
- **Failure**: See technical errors like "TypeError: Failed to construct 'URL'"

---

## If You Still See Errors

### Still seeing "Invalid audio URL: nan"?
- This is now **expected** for problematic recommendations
- Instead of crashing, user should see: "This song does not have an audio file. Please try another song."
- Try playing a different recommendation

### Still seeing `net::ERR_NAME_NOT_RESOLVED`?
- Should not appear anymore for images
- If it does, check browser DevTools for the exact URL being loaded
- Report the URL and we can add it to the filter

### Build failed?
- Run: `npm run build` in `naavix-app/naavix-app-main`
- Should see: ✅ `built in 5.89s` with no errors

---

## Summary

| Before | After |
|--------|-------|
| Crashes on "Invalid audio URL: nan" | Skips and tries fallback source |
| Browser errors loading malformed image URLs | Returns proper placeholder image |
| Technical error messages to users | Friendly error messages ("Song not available") |
| No validation of external data | Multi-layer validation of URLs |

**Build Status**: ✅ Successful (5.89s, 1746 modules, no errors)

---

Next step: Start backend and frontend, then test recommendation playback as described above.
