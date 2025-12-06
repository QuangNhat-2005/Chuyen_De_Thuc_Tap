import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Import đúng đường dẫn (đã sửa ở bước trước)
import { useColorScheme } from '../hooks/use-color-scheme';
import { AuthProvider } from '../context/AuthContext';

// Ngăn màn hình splash tự ẩn cho đến khi App sẵn sàng
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();



  useEffect(() => {
    // Ẩn màn hình chờ ngay lập tức vì không còn đợi font nữa
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Trang Login (ẩn header) */}
          <Stack.Screen name="login" options={{ headerShown: false }} />
          
          {/* Các trang Tabs chính (ẩn header vì tabs tự có) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}