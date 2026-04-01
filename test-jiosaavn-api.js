const axios = require('axios');

const testSongId = 'GThGf0djcXs';

async function testAPI() {
  console.log(`\n🧪 Testing JioSaavn API with Song ID: ${testSongId}\n`);
  
  // Test 1: Current endpoint
  console.log(`📍 Test 1: Current endpoint format`);
  try {
    const url1 = `https://www.jiosaavn.com/api.php?__call=song.getDetails&_format=json&cc=in&includeRelated=false&songIds=${testSongId}`;
    console.log(`   URL: ${url1}`);
    const res1 = await axios.get(url1, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    console.log(`   ✅ Status: ${res1.status}`);
    console.log(`   Response keys: ${Object.keys(res1.data).join(', ')}`);
    console.log(`   Response: ${JSON.stringify(res1.data).substring(0, 200)}...`);
    
    if (res1.data[testSongId]) {
      console.log(`   ✅ Has song data for ${testSongId}`);
      const songData = res1.data[testSongId];
      console.log(`   Has downloadUrl: ${!!songData.downloadUrl}`);
      if (songData.downloadUrl) {
        console.log(`   downloadUrl length: ${songData.downloadUrl.length}`);
      }
    }
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
    console.log(`   Response data: ${e.response?.data ? JSON.stringify(e.response.data) : 'N/A'}`);
  }
  
  // Test 2: Add accept header
  console.log(`\n📍 Test 2: With Accept header`);
  try {
    const url2 = `https://www.jiosaavn.com/api.php?__call=song.getDetails&_format=json&cc=in&includeRelated=false&songIds=${testSongId}`;
    const res2 = await axios.get(url2, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    console.log(`   ✅ Status: ${res2.status}`);
    console.log(`   Response: ${JSON.stringify(res2.data).substring(0, 200)}...`);
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }
  
  // Test 3: Different parameter format
  console.log(`\n📍 Test 3: Try with comma-separated IDs`);
  try {
    const url3 = `https://www.jiosaavn.com/api.php?__call=song.getDetails&_format=json&cc=in&songIds=${testSongId}`;
    const res3 = await axios.get(url3, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    console.log(`   ✅ Status: ${res3.status}`);
    console.log(`   Response: ${JSON.stringify(res3.data).substring(0, 200)}...`);
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }
  
  // Test 4: Try different endpoint
  console.log(`\n📍 Test 4: Alternative endpoint (song.getDetails via query)`);
  try {
    const url4 = `https://www.jiosaavn.com/api.php?__call=song.getDetails&__name=${testSongId}&_format=json&_cc=in`;
    console.log(`   URL: ${url4}`);
    const res4 = await axios.get(url4, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    console.log(`   ✅ Status: ${res4.status}`);
    console.log(`   Response: ${JSON.stringify(res4.data).substring(0, 200)}...`);
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }
}

testAPI().catch(console.error);
