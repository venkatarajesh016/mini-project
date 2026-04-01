import axios from 'axios';

// This is the working API used for searches
const PROXY_API = "https://spotify-puce-xi.vercel.app/api";
const testSongId = 'GThGf0djcXs';

async function testProxyAPI() {
  console.log(`\n🧪 Testing Vercel Proxy API\n`);
  
  // Test 1: Search endpoint (we know this works)
  console.log(`📍 Test 1: Search endpoint`);
  try {
    const url = `${PROXY_API}/search/songs?query=Srivalli`;
    const res = await axios.get(url, { timeout: 5000 });
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response has ${res.data.length || '?'} items`);
    if (res.data && res.data[0]) {
      console.log(`   First result keys: ${Object.keys(res.data[0]).join(', ')}`);
      console.log(`   First result ID: ${res.data[0].id}`);
      console.log(`   Has downloadUrl: ${!!res.data[0].downloadUrl}`);
    }
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }
  
  // Test 2: Try song/{id} endpoint
  console.log(`\n📍 Test 2: Song details by ID`);
  try {
    const url = `${PROXY_API}/song/${testSongId}`;
    const res = await axios.get(url, { timeout: 5000 });
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response keys: ${Object.keys(res.data).join(', ')}`);
    console.log(`   Has downloadUrl: ${!!res.data.downloadUrl}`);
    if (res.data.downloadUrl && Array.isArray(res.data.downloadUrl)) {
      console.log(`   downloadUrl length: ${res.data.downloadUrl.length}`);
      res.data.downloadUrl.forEach((item, idx) => {
        if (item && item.url) {
          console.log(`   [${idx}] Quality: ${item.quality}, URL: ${item.url.substring(0, 70)}...`);
        }
      });
    }
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }
  
  // Test 3: Try songs endpoint
  console.log(`\n📍 Test 3: Songs endpoint with ID`);
  try {
    const url = `${PROXY_API}/songs/${testSongId}`;
    const res = await axios.get(url, { timeout: 5000 });
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(res.data).substring(0, 200)}...`);
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }
  
  // Test 4: Try details endpoint
  console.log(`\n📍 Test 4: Details endpoint`);
  try {
    const url = `${PROXY_API}/details/song/${testSongId}`;
    const res = await axios.get(url, { timeout: 5000 });
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response keys: ${Object.keys(res.data).join(', ')}`);
    console.log(`   Response: ${JSON.stringify(res.data).substring(0, 200)}...`);
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }
}

testProxyAPI().catch(console.error);
