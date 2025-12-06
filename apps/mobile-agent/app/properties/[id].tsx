import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Linking, Dimensions, Image } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; // Icon đẹp

// Cấu hình IP (Logic thông minh)
const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000/properties'
  : 'http://10.58.123.40:3000/properties'; // ⚠️ Thay đúng IP Wifi của bạn

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      setProperty(res.data);
    } catch (error) {
      console.error(error);
      alert('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (property?.contactPhone) {
      Linking.openURL(`tel:${property.contactPhone}`);
    } else {
      alert('Không có số điện thoại');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy tin đăng!</Text>
      </View>
    );
  }

  return (
    <>
      {/* Cấu hình Header: Hiện nút Back và Tiêu đề */}
      <Stack.Screen 
        options={{
          headerTitle: 'Chi tiết BĐS',
          headerBackTitle: 'Trở lại',
          headerTintColor: '#2563eb',
        }} 
      />

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* --- SLIDER ẢNH (Trượt ngang) --- */}
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
            {property.images && property.images.length > 0 ? (
              property.images.map((img: any, index: number) => (
                <Image 
                  key={index}
                  source={{ uri: img.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={[styles.image, styles.placeholder]}>
                <Text style={{color: '#666'}}>Không có ảnh</Text>
              </View>
            )}
          </ScrollView>

          {/* --- THÔNG TIN CHI TIẾT --- */}
          <View style={styles.content}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{property.type}</Text>
            </View>

            <Text style={styles.title}>{property.title}</Text>
            
            <Text style={styles.price}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(property.price)}
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.infoText}>{property.address}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="resize-outline" size={20} color="#2563eb" />
                <Text style={styles.statText}>{property.area} m²</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="bed-outline" size={20} color="#2563eb" />
                <Text style={styles.statText}>-- PN</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="water-outline" size={20} color="#2563eb" />
                <Text style={styles.statText}>-- WC</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
            <Text style={styles.description}>{property.description}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Liên hệ</Text>
            <View style={styles.agentCard}>
              <View style={styles.avatar}>
                <Text style={{fontSize: 20}}>👤</Text>
              </View>
              <View>
                <Text style={styles.agentName}>{property.contactName || 'Môi giới'}</Text>
                <Text style={styles.agentPhone}>{property.contactPhone}</Text>
              </View>
            </View>
          </View>
          
          {/* Khoảng trống để không bị nút che mất nội dung cuối */}
          <View style={{height: 100}} />
        </ScrollView>

        {/* --- THANH ACTION BAR (Dính đáy) --- */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={[styles.btn, styles.btnChat]}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2563eb" />
            <Text style={styles.btnChatText}>Chat Zalo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.btn, styles.btnCall]} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.btnCallText}>Gọi ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  imageContainer: { height: 300, width: width },
  image: { width: width, height: 300 },
  placeholder: { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },

  content: { padding: 20, marginTop: -20, backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  
  badge: { alignSelf: 'flex-start', backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, marginBottom: 10 },
  badgeText: { color: '#2563eb', fontWeight: 'bold', fontSize: 12 },

  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
  price: { fontSize: 24, fontWeight: '800', color: '#2563eb', marginBottom: 15 },

  infoRow: { flexDirection: 'row', marginBottom: 15 },
  infoItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  infoText: { marginLeft: 5, color: '#4b5563', fontSize: 15 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f9fafb', padding: 15, borderRadius: 10, marginBottom: 20 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontWeight: '600', color: '#374151' },

  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 20 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 24, color: '#4b5563' },

  agentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#bbf7d0' },
  avatar: { width: 50, height: 50, backgroundColor: '#fff', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  agentName: { fontWeight: 'bold', fontSize: 16 },
  agentPhone: { color: '#16a34a', fontWeight: '600' },

  bottomBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    flexDirection: 'row', padding: 15, backgroundColor: '#fff', 
    borderTopWidth: 1, borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 30 : 15 
  },
  btn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 10, gap: 8 },
  btnChat: { backgroundColor: '#eff6ff', marginRight: 10 },
  btnChatText: { color: '#2563eb', fontWeight: 'bold' },
  btnCall: { backgroundColor: '#2563eb' },
  btnCallText: { color: '#fff', fontWeight: 'bold' },
});