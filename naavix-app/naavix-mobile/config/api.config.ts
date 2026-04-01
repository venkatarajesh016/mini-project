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
    if (Platform.OS === 'android') {
        // Check if running in Expo Go on physical device
        // In Expo, Constants.platform?.android?.isDevice tells us if it's a physical device
        const isPhysicalDevice = Constants.isDevice || Platform.OS !== 'android' || !__DEV__;
        
        if (isPhysicalDevice || !Constants.isDevice) {
            // Physical device or Expo Go app - use machine WiFi IP
            console.log('🔧 Detected physical Android device, using machine WiFi IP');
            return 'http://10.127.165.141:3000';
        }
        
        // Android Emulator - use special emulator IP
        console.log('🔧 Detected Android Emulator, using 10.0.2.2');
        return 'http://10.0.2.2:3000';
    } else if (Platform.OS === 'ios') {
        // iOS Simulator or physical device
        return __DEV__ ? 'http://127.0.0.1:3000' : 'http://10.127.165.141:3000';
    }
    
    // Fallback to IP for physical devices on unknown platforms
    return 'http://10.127.165.141:3000';
})();

console.log('✅ Using API URL:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);
console.log('🎯 Is Device:', Constants.isDevice);

export default API_BASE_URL;
