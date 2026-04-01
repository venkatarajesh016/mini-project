#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://192.168.137.242:3000';

async function testEndpoint() {
  console.log('🧪 Testing external songs endpoint...\n');

  try {
    console.log('📍 Testing: GET /external-songs?q=test');
    const response = await axios.get(`${BASE_URL}/external-songs`, {
      params: { q: 'test' },
      timeout: 10000,
    });

    console.log('✅ Response received!');
    console.log('Status:', response.status);
    console.log('Songs count:', response.data.count);
    console.log('Success:', response.data.success);
    console.log('Source:', response.data.source || 'unknown');
    console.log('\nFirst 2 songs:');
    console.log(JSON.stringify(response.data.songs.slice(0, 2), null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testEndpoint();
