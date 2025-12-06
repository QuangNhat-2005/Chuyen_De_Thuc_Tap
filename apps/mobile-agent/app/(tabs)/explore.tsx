import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, Platform, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Cấu hình IP
const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://10.58.123.40:3000'; // ⚠️ Thay đúng IP Wifi của bạn

export default function CreatePropertyScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  const [form, setForm] = useState({
    title: '',
    price: '',
    area: '',
    address: '',
    description: '',
    type: 'HOUSE',
    contactPhone: user?.phone || '',
  });

const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền bị từ chối', 'Cần cấp quyền truy cập ảnh để đăng tin!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    console.log("Bắt đầu đăng tin..."); // Log để biết nút đã bấm

    if (!form.title || !form.price || !form.address) {
      // Trên Web Alert đôi khi không hiện rõ, dùng confirm hoặc alert của window
      if (Platform.OS === 'web') {
        window.alert('Vui lòng nhập Tiêu đề, Giá và Địa chỉ');
      } else {
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập Tiêu đề, Giá và Địa chỉ');
      }
      return;
    }

    setLoading(true);
    try {
      // 1. Lấy Token
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('accessToken');
      } else {
        token = await SecureStore.getItemAsync('accessToken');
      }

      // 2. Upload ảnh (Xử lý riêng cho Web và Mobile)
      const uploadedUrls: string[] = [];
      
      for (const uri of images) {
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'photo.jpg';
        
        if (Platform.OS === 'web') {
          // --- LOGIC CHO WEB: Phải chuyển URI thành Blob ---
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append('file', blob, filename);
        } else {
          // --- LOGIC CHO MOBILE: Gửi object ---
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          // @ts-ignore
          formData.append('file', { uri, name: filename, type });
        }

        console.log("Đang upload ảnh:", filename);
        
        const uploadRes = await axios.post(`${BASE_URL}/properties/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
        uploadedUrls.push(uploadRes.data.secure_url);
      }

      // 3. Gửi thông tin nhà
      console.log("Đang lưu thông tin nhà...");
      await axios.post(`${BASE_URL}/properties`, {
        ...form,
        price: Number(form.price),
        area: Number(form.area),
        images: uploadedUrls,
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (Platform.OS === 'web') {
        window.alert('Đăng tin thành công!');
      } else {
        Alert.alert('Thành công', 'Đăng tin thành công!');
      }
      
      // Reset form
      setForm({ title: '', price: '', area: '', address: '', description: '', type: 'HOUSE', contactPhone: user?.phone || '' });
      setImages([]);
      router.replace('/(tabs)');

    } catch (error: any) {
      console.error("Lỗi chi tiết:", error);
      const msg = error.response?.data?.message || 'Không thể đăng tin';
      if (Platform.OS === 'web') {
        window.alert('Lỗi: ' + msg);
      } else {
        Alert.alert('Lỗi', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đăng tin mới</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Hình ảnh ({images.length})</Text>
        <ScrollView horizontal style={styles.imageScroll}>
          <TouchableOpacity style={styles.addBtn} onPress={pickImage}>
            <Ionicons name="camera" size={30} color="#666" />
            <Text style={{fontSize: 12, color: '#666'}}>Thêm ảnh</Text>
          </TouchableOpacity>

          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.thumb} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.label}>Tiêu đề tin</Text>
        <TextInput 
          style={styles.input} 
          placeholder="VD: Bán nhà mặt tiền..." 
          value={form.title}
          onChangeText={(t) => setForm({...form, title: t})}
        />

        <View style={styles.row}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={styles.label}>Giá (VNĐ)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0" 
              keyboardType="numeric"
              value={form.price}
              onChangeText={(t) => setForm({...form, price: t})}
            />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Diện tích (m²)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="0" 
              keyboardType="numeric"
              value={form.area}
              onChangeText={(t) => setForm({...form, area: t})}
            />
          </View>
        </View>

        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Số nhà, đường, quận..." 
          value={form.address}
          onChangeText={(t) => setForm({...form, address: t})}
        />

        <Text style={styles.label}>Mô tả chi tiết</Text>
        <TextInput 
          style={[styles.input, {height: 100, textAlignVertical: 'top'}]} 
          placeholder="Mô tả thêm về căn nhà..." 
          multiline
          value={form.description}
          onChangeText={(t) => setForm({...form, description: t})}
        />

        <View style={{height: 100}} /> 
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>ĐĂNG TIN NGAY</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  content: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  row: { flexDirection: 'row' },
  imageScroll: { flexDirection: 'row', marginBottom: 10 },
  addBtn: { width: 80, height: 80, backgroundColor: '#e5e7eb', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  imageWrapper: { marginRight: 10, position: 'relative' },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  removeBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#fff', borderRadius: 12 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  submitBtn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});