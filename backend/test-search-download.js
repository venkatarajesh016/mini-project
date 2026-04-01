import axios from 'axios';

async function testSearchWithDownloadUrl() {
  console.log(`\n🧪 Testing search endpoint for audio URLs\n`);
  
  console.log(`📍 Searching for "Srivalli"...`);
  try {
    const endpoint = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&q=Srivalli`;
    const res = await axios.get(endpoint, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    console.log(`   ✅ Status: ${res.status}`);
    const data = res.data;
    
    if (data.songs && data.songs.length > 0) {
      const firstSong = data.songs[0];
      console.log(`   ✅ Got ${data.songs.length} songs`);
      console.log(`   First song ID: ${firstSong.id}`);
      console.log(`   Song keys: ${Object.keys(firstSong).join(', ')}`);
      console.log(`   Has downloadUrl: ${!!firstSong.downloadUrl}`);
      console.log(`   Has url: ${!!firstSong.url}`);
      console.log(`   Has playUrl: ${!!firstSong.playUrl}`);
      
      if (firstSong.downloadUrl && Array.isArray(firstSong.downloadUrl)) {
        console.log(`   \n   downloadUrl array length: ${firstSong.downloadUrl.length}`);
        firstSong.downloadUrl.forEach((item, idx) => {
          if (item && item.url) {
            console.log(`   [${idx}] Quality: ${item.quality}, URL exists: true`);
          }
        });
      }
    } else {
      console.log(`   ❌ No songs in response`);
      console.log(`   Response keys: ${Object.keys(data).join(', ')}`);
      console.log(`   Response: ${JSON.stringify(data).substring(0, 300)}...`);
    }
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }
}

testSearchWithDownloadUrl().catch(console.error);
