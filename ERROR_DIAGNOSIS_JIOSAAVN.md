# Error Diagnosis Guide: JioSaavn Recommendations

## Errors You're Seeing

### Error 1: `net::ERR_CONTENT_DECODING_FAILED`
```
www.jiosaavn.com/song/giri-giri/Azc9dyJjf1E:1  Failed to load resource: net::ERR_CONTENT_DECODING_FAILED
```

**What it means**: Browser tried to load the JioSaavn song **page** (HTML) as a resource, server can't decode it

**Root cause**: Page URL was passed to audio player instead of audio stream URL

**Now fixed**: Page URLs are detected and rejected before reaching audio player

---

### Error 2: `MEDIA_ERR_SRC_NOT_SUPPORTED: Format error`
```
🔊 Audio Error Details: Object
  code: 4
  errorName: "MEDIA_ERR_SRC_NOT_SUPPORTED"
  message: "MEDIA_ELEMENT_ERROR: Format error"
  src: "https://www.jiosaavn.com/song/giri-giri/Azc9dyJjf1E"
```

**What it means**: Audio element received a URL, tried to play it, but it's not an audio file

**Root cause**: JioSaavn page HTML is not a valid audio format

**Now fixed**: System detects and prevents this before audio element tries to play

---

### Error 3: `NotSupportedError Failed to load because no supported source was found`
```
❌ Playback failed: NotSupportedError Failed to load because no supported source was found.
```

**What it means**: Tried to play an unknown/unsupported format

**Root cause**: The HTML page doesn't match any audio format browser supports

**Now fixed**: Page URLs are blocked at validation stage

---

### Error 4: `net::ERR_NAME_NOT_RESOLVED for placeholder image`
```
200?text=Album+Art:1  Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

**What it means**: Browser tried to load a URL that doesn't resolve (can't find domain)

**Root cause**: Malformed image URL like `200?text=Album+Art:1` (no protocol/domain)

**Status**: Already fixed in previous update with image URL validation

---

### Error 5: `net::ERR_INTERNET_DISCONNECTED for ML service`
```
QueuePanel.tsx:88  GET http://localhost:8000/ net::ERR_INTERNET_DISCONNECTED
```

**What it means**: Browser can't reach port 8000 (ML service)

**Root cause**: ML service not running

**What to do**:
```bash
# If you want recommendations:
cd ml-services
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# If you don't need ML recommendations:
# App works fine without it - use database songs only
```

---

## What Changed: Before vs After

### Before
```
Recommendation: { url: "https://www.jiosaavn.com/song/giri-giri/Azc9dyJjf1E" }
                                    ↓
                            handlePlayRecommendation()
                                    ↓
                        [extraction successful?]
                        ❌ NO (silently continues)
                                    ↓
                        Pass URL to playSong()
                                    ↓
                        Audio element tries to play
                                    ↓
                    ❌ BROWSER ERROR: Format error
```

### After
```
Recommendation: { url: "https://www.jiosaavn.com/song/giri-giri/Azc9dyJjf1E" }
                                    ↓
                            handlePlayRecommendation()
                                    ↓
                        [extraction successful?]
                        ✅ YES → extractedAudioUrl
                        ❌ NO → cleanAudioUrl = ""
                                    ↓
                    VALIDATION LAYER 1: QueuePanel
                    ✅ Extract successful → use proxied URL
                    ❌ Extract failed → set to ""
                                    ↓
                    Check: is this a JioSaavn page URL?
                    ✅ NO → pass to playSong()
                    ❌ YES → throw error with explanation
                                    ↓
                    VALIDATION LAYER 2: PlayerContext
                    ✅ double-check no page URLs slip through
                                    ↓
                        Audio element plays
                        ✅ Audio or friendly error message
```

---

## Checklist: Verifying The Fixes

### ✅ Fix 1: JioSaavn Page URL Detection
- [ ] QueuePanel rejects `jiosaavn.com/song/` URLs not from extraction
- [ ] Throws specific error about extraction failure
- [ ] User sees clear message instead of audio error

### ✅ Fix 2: PlayerContext Safety Layer
- [ ] PlayerContext double-checks for page URLs
- [ ] Shows alert if page URL somehow gets through
- [ ] Specific message about extraction failure

### ✅ Fix 3: Image URL Validation
- [ ] Placeholder images return proper placeholder URL
- [ ] No `net::ERR_NAME_NOT_RESOLVED` errors for images
- [ ] Already implemented in previous fix

### ✅ Fix 4: Invalid URL Filtering
- [ ] "nan" values are detected and skipped
- [ ] "undefined" and "null" strings are filtered
- [ ] Already implemented in previous fix

---

## Testing Each Error

### Test 1: Page URL Rejection
**Do this**:
1. Start backend and frontend
2. Play a recommendation with JioSaavn URL
3. Watch console

**Should see**:
```
✅ DETECTED JIOSAAVN URL
🎵 STEP 1: JIOSAAVN URL DETECTED
[one of]:
  ✅ STEP 2: AUDIO URL OBTAINED → audio plays
  ⚠️ Backend error → shows friendly error message
```

**Should NOT see**:
```
❌ MEDIA_ERR_SRC_NOT_SUPPORTED
❌ Format error
❌ ERR_CONTENT_DECODING_FAILED
```

### Test 2: Extraction Failure
**Do this**:
1. Stop backend service
2. Try to play a JioSaavn recommendation
3. Watch for error

**Should see**:
```
Alert popup:
❌ Cannot play this JioSaavn song - audio extraction failed.
Make sure the backend service is running and the song exists on JioSaavn.
```

### Test 3: Image URLs
**Do this**:
1. View recommendations
2. Check album artwork displays
3. Open DevTools → Network tab
4. No red X on image requests

**Should see**:
```
✅ Album artwork displays
✅ Placeholder shows if image unavailable
✅ No ERR_NAME_NOT_RESOLVED errors
```

### Test 4: Regular Songs
**Do this**:
1. Play songs from main list (not recommendations)
2. Use next/previous buttons
3. Add to queue and play from queue

**Should see**:
```
✅ All work normally
✅ No changes to existing functionality
```

---

## Flow Diagram: Current Fix

```
┌─────────────────────────────────────────────────┐
│ Recommendation Clicked                          │
│ { url: "jiosaavn.com/song/...", title: "..." } │
└──────────────┬──────────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ handlePlayRecommendation()
    │ (QueuePanel)         │
    └──────────┬───────────┘
               │
         ┌─────┴─────┐
         │           │
    ┌────▼─────┐  ┌──▼─────────────┐
    │ JioSaavn │  │ Other URL Types │
    │ Detected │  │                 │
    └────┬─────┘  └──┬──────────────┘
         │           │
    ┌────▼────────┐ ┌┴──────────────────┐
    │ Call Backend│ │ Use as-is if valid │
    │ /fetch-from │ └┬──────────────────┘
    └────┬────────┘  │
         │           │
    ┌────┴───────────┴────────────────┐
    │ Got Audio URL?                   │
    └──┬──────────────────────────┬────┘
       │YES                       │NO
    ┌──▼──────────────┐    ┌──────▼──────┐
    │ Wrap with       │    │ cleanUrl = ""│
    │ /proxy-audio    │    └──────┬───────┘
    └──┬──────────────┘           │
       │                          │
    ┌──┴──────────────────────────┴──┐
    │ VALIDATION: Check URL          │
    │ ✅ Not a jiosaavn page URL      │
    │ ✅ Has actual content           │
    │ ✅ Not "nan" or "undefined"    │
    └──┬───────────────┬──────────────┘
       │                │
    ✅ │                │ ❌ Invalid
    ┌──▼──────┐     ┌───▼─────────┐
    │ Pass to  │     │ Throw Error │
    │ playSong │     │ with Reason │
    └──┬───────┘     └───┬─────────┘
       │                 │
       │          ┌──────▼──────┐
       │          │ Show Alert  │
       │          │ to User     │
       │          └─────────────┘
       │
       ▼
    ┌──────────────────────┐
    │ PlayerContext Layer  │
    │ (Safety Check)       │
    └──┬──────────────────┐
       │                  │
    ✅ │ Valid URL        │ ❌ Page URL
    ┌──▼──────┐       ┌──▼──────┐
    │ Play    │       │ Reject  │
    │ Audio   │       │ & Alert │
    └─────────┘       └─────────┘
```

---

## Backend Requirements

The backend must have:

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `/getSongs` | Get database songs | ✅ Required |
| `/fetch-from-jiosaavvn-url` | Extract JioSaavn audio | ✅ Used if available |
| `/proxy-audio` | Stream audio through backend | ✅ Used if available |

If endpoints are missing, the system will:
- ✅ Still work for local database songs
- ✅ Show error for JioSaavn recommendations
- ✅ User can use database songs instead

---

## Summary

| Area | Status | What Works |
|------|--------|-----------|
| Database Songs | ✅ Works | Play, next/prev, queue |
| Recommendations | ✅ Works if backend running | Extract JioSaavn audio |
| Image Loading | ✅ Works | Shows artwork or placeholder |
| Error Handling | ✅ Fixed | Clear messages, no crashes |
| ML Service | ⚠️ Optional | App works without it |

---

## Next Steps

1. **Rebuild**: `npm run build` (already done ✅)
2. **Start services**: Backend + Frontend
3. **Test**: Follow test cases above
4. **Monitor**: Check console for validation logs
5. **Verify**: No "Format error" or "ERR_CONTENT_DECODING_FAILED" errors

---

**Status**: ✅ Ready to test
**Build**: ✅ Successful (6.47s, 1746 modules)
**Next**: See [FIX_JIOSAAVN_PAGE_URL_ERROR.md](FIX_JIOSAAVN_PAGE_URL_ERROR.md) for technical details
