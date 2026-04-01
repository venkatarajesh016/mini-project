/**
 * Quick test for JioSaavn song fetching
 */

import axios from 'axios';

const testUrl = 'https://www.jiosaavn.com/song/nijame-ne-chebutunna/MV8qcCFcXws';

console.log('🧪 Testing JioSaavn URL fetching...\n');
console.log(`📍 Test URL: ${testUrl}\n`);

// Extract song ID
const songId = testUrl.split('/').pop();
console.log(`✅ Extracted Song ID: ${songId}\n`);

// Test CDN URL patterns
const urlPatterns = [
  `https://aac.saavncdn.com/${songId}.mp4`,
  `https://aac.saavncdn.com/${songId}_160.mp4`,
  `https://aac.saavncdn.com/${songId}_96.mp4`,
];

console.log('🔗 Testing CDN URL patterns:\n');

for (const url of urlPatterns) {
  try {
    console.log(`🔄 Testing: ${url}`);
    const response = await axios.head(url, {
      timeout: 3000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      maxRedirects: 5,
    });
    
    console.log(`✅ SUCCESS! Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Content-Length: ${response.headers['content-length']}\n`);
  } catch (error) {
    console.log(`❌ Failed: ${error.message}\n`);
  }
}

// Also try fetching the page
console.log('\n📄 Attempting to fetch metadata from JioSaavn page...\n');

try {
  const pageResponse = await axios.get(testUrl, {
    timeout: 5000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  // Look for JSON-LD
  const jsonLdMatch = pageResponse.data.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if (jsonLdMatch) {
    console.log('✅ Found JSON-LD data');
    const jsonLd = JSON.parse(jsonLdMatch[1]);
    console.log('   Title:', jsonLd.name);
    console.log('   Artist:', jsonLd.byArtist?.name);
    if (jsonLd.contentUrl) console.log('   Content URL:', jsonLd.contentUrl);
    if (jsonLd.url) console.log('   URL:', jsonLd.url);
  } else {
    console.log('❌ No JSON-LD found');
  }

  // Look for og:title
  const ogTitleMatch = pageResponse.data.match(/<meta property="og:title" content="([^"]*)/);
  if (ogTitleMatch) {
    console.log('✅ Found OG Title:', ogTitleMatch[1]);
  }

} catch (error) {
  console.error('❌ Failed to fetch page:', error.message);
}
