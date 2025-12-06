import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Cấu hình IP (Copy lại logic thông minh lúc nãy)
const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000/auth/login'
  : 'http://10.57.83.40:3000/auth/login';

export default function LoginScreen() {
  const [email, setEmail] = useState('sale@estate.com'); // Điền sẵn cho nhanh test
  const [password, setPassword] = useState('123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      console.log('Connecting to:', API_URL);
      const res = await axios.post(API_URL, { email, password });
      
      // Gọi hàm login từ Context để lưu token và chuyển trang
      login(res.data.access_token, res.data.user);
      
    } catch (error: any) {
      console.error(error);
      Alert.alert('Đăng nhập thất bại', error.response?.data?.message || 'Lỗi kết nối Server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🏢 Estate Nexus</Text>
        <Text style={styles.subtitle}>Dành cho Nhà Môi Giới Chuyên Nghiệp</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Nhập email..." 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Nhập mật khẩu..." 
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#6b7280' },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 5, marginTop: 15 },
  input: { 
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9fafb' 
  },
  button: {
    backgroundColor: '#2563eb', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});