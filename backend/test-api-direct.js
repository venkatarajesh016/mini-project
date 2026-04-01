import axios from 'axios';

console.log('Starting test...');

const url = 'https://spotify-puce-xi.vercel.app/api/search/songs?query=telugu';
console.log('URL:', url);

try {
  console.log('Making request...');
  const response = await axios.get(url, { timeout: 5000 });
  console.log('Response received!');
  console.log('Status:', response.status);
  console.log('Data keys:', Object.keys(response.data));
  console.log('Full data:', JSON.stringify(response.data, null, 2).slice(0, 500));
} catch (err) {
  console.error('Error:', err.message);
  console.error('Code:', err.code);
}
