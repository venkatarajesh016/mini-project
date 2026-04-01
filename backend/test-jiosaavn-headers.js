import axios from 'axios';

const testSongId = 'GThGf0djcXs';

async function testAPI() {
  console.log(`\n🧪 Testing JioSaavn API with better headers\n`);
  
  // Test with full browser headers
  console.log(`📍 Test 1: Full browser headers + referer`);
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=song.getDetails&_format=json&cc=in&includeRelated=false&songIds=${testSongId}`;
    const res = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.jiosaavn.com/',
        'Origin': 'https://www.jiosaavn.com',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Cache-Control': 'no-cache',
      },
    });
    console.log(`   ✅ Status: ${res.status}`);
    const data = JSON.stringify(res.data);
    console.log(`   Response: ${data.substring(0, 300)}...`);
    
    if (res.data[testSongId]) {
      console.log(`   ✅ Has song data!`);
    }
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }
  
  // Test with POST method
  console.log(`\n📍 Test 2: POST method`);
  try {
    const url = `https://www.jiosaavn.com/api.php`;
    const res = await axios.post(url, null, {
      timeout: 5000,
      params: {
        __call: 'song.getDetails',
        _format: 'json',
        cc: 'in',
        includeRelated: false,
        songIds: testSongId,
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response: ${JSON.stringify(res.data).substring(0, 300)}...`);
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }
  
  // Test search instead of getDetails
  console.log(`\n📍 Test 3: Using song.search endpoint`);
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=song.search&_format=json&query=${testSongId}&n=1`;
    const res = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    console.log(`   ✅ Status: ${res.status}`);
    console.log(`   Response keys: ${Object.keys(res.data).join(', ')}`);
    console.log(`   Response: ${JSON.stringify(res.data).substring(0, 300)}...`);
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }
}

testAPI().catch(console.error);
