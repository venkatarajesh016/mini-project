import axios from 'axios';

const testSongUrl = 'https://www.jiosaavn.com/song/undiporaadhey-sad-version/GThGf0djcXs';

async function testPageScraping() {
  console.log(`\n🧪 Testing page scraping\n`);
  
  console.log(`📍 Fetching JioSaavn page...`);
  try {
    const res = await axios.get(testSongUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    console.log(`   ✅ Page fetched (${res.data.length} bytes)`);
    
    // Look for downloadUrl in the page
    if (res.data.includes('downloadUrl')) {
      console.log(`   ✅ Found 'downloadUrl' in page`);
      
      // Try to extract the array
      const match = res.data.match(/"downloadUrl":\s*(\[[\s\S]*?\])/);
      if (match) {
        console.log(`   Found downloadUrl array (${match[1].length} chars)`);
        try {
          const urls = JSON.parse(match[1]);
          console.log(`   downloadUrl is array: ${Array.isArray(urls)}, length: ${urls?.length}`);
          if (Array.isArray(urls)) {
            urls.forEach((item, idx) => {
              if (item && item.url) {
                console.log(`   [${idx}] Quality: ${item.quality}, URL: ${item.url.substring(0, 80)}...`);
              }
            });
          }
        } catch (e) {
          console.log(`   Could not parse JSON: ${e.message}`);
          console.log(`   Raw: ${match[1].substring(0, 200)}...`);
        }
      }
    } else {
      console.log(`   ❌ No 'downloadUrl' found in page`);
    }
    
    // Also search for "url" with "quality" nearby
    const urlMatches = res.data.match(/"url":\s*"https:\/\/[^"]*"/g);
    if (urlMatches) {
      console.log(`\n   Found ${urlMatches.length} URL patterns in page`);
      urlMatches.slice(0, 3).forEach((url, idx) => {
        console.log(`   [${idx}] ${url.substring(0, 80)}...`);
      });
    }
    
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }
}

testPageScraping().catch(console.error);
