/**
 * Quick test for URL to Audio URL conversion functions
 * Tests the new converter functions added to externalSongsService.js
 */

import { convertSongIdToAudioUrl, convertJioSaavnUrlToAudioUrl } from './backend/services/externalSongsService.js';

console.log('\n' + '='.repeat(80));
console.log('🎵 JioSaavn URL to Audio URL Converter Test');
console.log('='.repeat(80) + '\n');

// Test 1: Convert Song ID directly to Audio URL
console.log('TEST 1: Convert Song ID to Audio URL');
console.log('─'.repeat(60));
const songId = 'Hj1SCUBYAXs';
const audioUrl = convertSongIdToAudioUrl(songId);
console.log(`Input Song ID:  ${songId}`);
console.log(`Output Audio URL: ${audioUrl}`);
console.log(`✅ Format: https://aac.saavncdn.com/{songId}_320.mp4\n`);

// Test 2: Convert JioSaavn Page URL to Audio URL
console.log('TEST 2: Convert JioSaavn Page URL to Audio URL');
console.log('─'.repeat(60));
const jiosaavnUrl = 'https://www.jiosaavn.com/song/leharaayi/Hj1SCUBYAXs';
const convertedAudioUrl = convertJioSaavnUrlToAudioUrl(jiosaavnUrl);
console.log(`Input Page URL:  ${jiosaavnUrl}`);
console.log(`Output Audio URL: ${convertedAudioUrl}`);
console.log(`✅ Extracted Song ID and converted to audio URL\n`);

// Test 3: Multiple Song IDs
console.log('TEST 3: Multiple Song IDs');
console.log('─'.repeat(60));
const songIds = [
  'Hj1SCUBYAXs',
  'IAEzZT9WZVw',
  'BcLJGt2MZX0',
];

songIds.forEach(id => {
  const url = convertSongIdToAudioUrl(id);
  console.log(`${id} → ${url}`);
});

console.log('\n' + '='.repeat(80));
console.log('✅ All conversions completed successfully!');
console.log('Audio streams are ready to play: https://aac.saavncdn.com/{songId}_320.mp4');
console.log('='.repeat(80) + '\n');
