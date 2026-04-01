import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * API Configuration based on platform and environment
 * For physical Android phones: uses machine IP (192.168.137.242)
 * For Android Emulator: uses 10.0.2.2
 * For iOS Simulator: uses 127.0.0.1
 * For physical iOS: uses machine IP
 */

const API_BASE_URL = (() => {
    // For now, always use localhost for development
    console.log('✅ Using API URL: http://127.0.0.1:3000 (localhost)');
    return 'http://127.0.0.1:3000';
})();

console.log('✅ Using API URL:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);
console.log('🎯 Is Device:', Constants.isDevice);

export default API_BASE_URL;
