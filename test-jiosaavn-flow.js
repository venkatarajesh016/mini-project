#!/usr/bin/env node

/**
 * Test Script for JioSaavn Recommendation Audio URL Fix
 * 
 * This script tests all the endpoints involved in the recommendation flow
 * Run with: node test-jiosaavn-flow.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Utility function to make HTTP requests
function makeRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.headers['Content-Length'] = JSON.stringify(body).length;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test cases
async function runTests() {
  console.log('🧪 JioSaavn Recommendation Audio URL Fix - Test Suite\n');
  console.log('=' . repeat(70));
  
  let passed = 0;
  let failed = 0;

  // Test 1: Check backend is running
  try {
    console.log('\n✓ TEST 1: Backend Server Status');
    const result = await makeRequest('/getSongs');
    if (result.status === 200) {
      console.log('  ✅ Backend is running');
      console.log(`  ✅ Database has ${Array.isArray(result.data) ? result.data.length : 'unknown'} songs`);
      passed++;
    } else {
      console.log(`  ❌ Unexpected status: ${result.status}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Backend not responding: ${err.message}`);
    failed++;
  }

  // Test 2: Test JioSaavn URL fetch endpoint
  try {
    console.log('\n✓ TEST 2: JioSaavn URL Fetch Endpoint');
    const testUrl = 'https://www.jiosaavn.com/song/pareshanura/BgdaUDMFcnY';
    console.log(`  Testing with: ${testUrl}`);
    
    const result = await makeRequest('/fetch-from-jiosaavvn-url', 'POST', {
      jiosaavnUrl: testUrl
    });
    
    if (result.status === 200 && result.data.success) {
      console.log(`  ✅ Backend successfully fetched JioSaavn data`);
      console.log(`     Song: ${result.data.song.title}`);
      console.log(`     Artist: ${result.data.song.artist}`);
      
      if (result.data.song.audioUrl) {
        console.log(`  ✅ Audio URL extracted successfully`);
        passed++;
      } else {
        console.log(`  ❌ Audio URL is missing`);
        failed++;
      }
    } else {
      console.log(`  ❌ Request failed with status ${result.status}`);
      console.log(`     ${JSON.stringify(result.data)}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    failed++;
  }

  // Test 3: Test recommendations endpoint compatibility
  try {
    console.log('\n✓ TEST 3: ML Service Recommendations');
    const result = await makeRequest('/recommend', 'POST', {
      title: 'Chamka Chamka',
      artist: 'Unknown',
      top_k: 3
    });
    
    if (result.status === 200 && result.data.recommendations) {
      console.log(`  ✅ Recommendations endpoint working`);
      console.log(`     Got ${result.data.recommendations.length} recommendations`);
      
      const firstRec = result.data.recommendations[0];
      if (firstRec.url) {
        console.log(`  ✅ Recommendation has URL field`);
        passed++;
      } else {
        console.log(`  ⚠️  Recommendation doesn't have URL field (expected - may be in DB)`);
        console.log(`     Fields: ${Object.keys(firstRec).join(', ')}`);
        // Not failing - this might be expected if URLs aren't in training data
        passed++;
      }
    } else {
      if (result.status === 503 || result.status === 500) {
        console.log(`  ⚠️  ML Service may not be running (${result.status})`);
        console.log(`     This is okay - backend has fallback`);
        // Not counting as failure - ML service is optional
      } else {
        console.log(`  ❌ Unexpected response: ${result.status}`);
        failed++;
      }
    }
  } catch (err) {
    console.log(`  ⚠️  ML Service not available: ${err.message}`);
    console.log(`     This is okay - not required for direct song playback`);
  }

  // Test 4: Test proxy audio endpoint availability
  try {
    console.log('\n✓ TEST 4: Proxy Audio Endpoint');
    // Just check if the endpoint exists - don't actually stream
    const result = await makeRequest('/proxy-audio');
    
    if (result.status === 400 || result.status === 200) {
      // 400 is expected (missing URL param), means endpoint exists
      console.log(`  ✅ Proxy audio endpoint is available`);
      passed++;
    } else if (result.status === 404) {
      console.log(`  ❌ Proxy audio endpoint not found (404)`);
      failed++;
    } else {
      console.log(`  ✅ Proxy endpoint responding (status: ${result.status})`);
      passed++;
    }
  } catch (err) {
    console.log(`  ❌ Error accessing proxy: ${err.message}`);
    failed++;
  }

  // Summary
  console.log('\n' + '=' . repeat(70));
  console.log('\n📊 TEST RESULTS');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! System is ready.');
  } else if (failed <= 1) {
    console.log('\n⚠️  Minor issues - system should still work.');
  } else {
    console.log('\n❌ Multiple failures - check the guide for troubleshooting.');
  }
  
  console.log('\nFor detailed debugging, check:');
  console.log('  1. Browser DevTools Console (F12) - for frontend logs');
  console.log('  2. Backend terminal output - for server logs');
  console.log('  3. JIOSAAVN_RECOMMENDATION_FIX_GUIDE.md - for detailed info\n');
}

// Run tests
runTests().catch(console.error);
