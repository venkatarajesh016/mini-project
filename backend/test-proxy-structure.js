import axios from 'axios';

const PROXY_API = "https://spotify-puce-xi.vercel.app/api";

async function testProxyAPI() {
  console.log(`\n🧪 Testing search API response structure\n`);
  
  try {
    const url = `${PROXY_API}/search/songs?query=Srivalli`;
    console.log(`Fetching: ${url}`);
    const res = await axios.get(url, { timeout: 5000 });
    
    console.log(`\n✅ Status: ${res.status}`);
    console.log(`Response type: ${typeof res.data}`);
    console.log(`Is array: ${Array.isArray(res.data)}`);
    
    if (Array.isArray(res.data)) {
      console.log(`Array length: ${res.data.length}`);
      
      if (res.data.length > 0) {
        console.log(`\n📍 First result:`);
        const first = res.data[0];
        console.log(`Keys: ${Object.keys(first).join(', ')}`);
        
        // Print full first song
        console.log(`\n🎵 Full first song object:`);
        console.log(JSON.stringify(first, null  , 2).substring(0, 1000));
        
        // Check for audio URL
        console.log(`\nHas downloadUrl: ${!!first.downloadUrl}`);
        console.log(`Has url: ${!!first.url}`);
        console.log(`Has playUrl: ${!!first.playUrl}`);
        console.log(`Has link: ${!!first.link}`);
        console.log(`Has songUrl: ${!!first.songUrl}`);
      }
    } else {
      console.log(`\nFull response (first 1000 chars):`);
      console.log(JSON.stringify(res.data, null, 2).substring(0, 1000));
    }
  } catch (e) {
    console.log(`❌ Error: ${e.message}`);
    console.log(`Status: ${e.response?.status}`);
    console.log(`Data: ${JSON.stringify(e.response?.data)}`);
  }
}

testProxyAPI().catch(console.error);
