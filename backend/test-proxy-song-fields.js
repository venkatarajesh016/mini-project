import axios from 'axios';

const PROXY_API = "https://spotify-puce-xi.vercel.app/api";

async function testProxyAPI() {
  console.log(`\n🧪 Checking for downloadUrl in search results\n`);
  
  try {
    const url = `${PROXY_API}/search/songs?query=Srivalli`;
    const res = await axios.get(url, { timeout: 5000 });
    
    if (res.data.data && res.data.data.results && res.data.data.results[0]) {
      const song = res.data.data.results[0];
      console.log(`Song: "${song.name}" (ID: ${song.id})`);
      console.log(`Keys in song object:`);
      Object.keys(song).forEach(key => {
        const val = song[key];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          console.log(`  ${key}: {` + Object.keys(val).slice(0, 3).join(', ') + `}`);
        } else if (Array.isArray(val)) {
          console.log(`  ${key}: [array, length: ${val.length}]`);
        } else {
          console.log(`  ${key}: ${String(val).substring(0, 50)}`);
        }
      });
      
      console.log(`\n🔍 Checking for audio URL fields:`);
      console.log(`  downloadUrl: ${!!song.downloadUrl}`);
      console.log(`  streamingUrl: ${!!song.streamingUrl}`);
      console.log(`  audioUrl: ${!!song.audioUrl}`);
      console.log(`  previewUrl: ${!!song.previewUrl}`);
      console.log(`  playUrl: ${!!song.playUrl}`);
      
      // Check nested objects
      if (song.related) {
        console.log(`\n  related nested keys: ${Object.keys(song.related).join(', ')}`);
      }
      
      // Show the full song object as JSON
      console.log(`\n📋 Full song object (stringify):`);
      console.log(JSON.stringify(song, null, 2));
    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
  }
}

testProxyAPI().catch(console.error);
