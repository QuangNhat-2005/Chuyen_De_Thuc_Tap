import { useEffect, useState } from 'react';
// Platform đã được import ở đây rồi 👇
import { StyleSheet, Text, View, FlatList, ActivityIndicator, SafeAreaView, StatusBar, Platform, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

// Cấu hình IP (Tự động chọn Localhost hoặc IP LAN)
const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000/properties'
  : 'http://172.16.7.166:3000/properties'; // IP Ethernet của bạn

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  area: number;
  type: string;
  images?: { url: string }[];
}

export default function HomeScreen() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      console.log("Đang kết nối tới:", API_URL);
      const response = await axios.get(API_URL);
      console.log("Lấy được:", response.data.length, "bất động sản");
      setProperties(response.data);
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      if (Platform.OS !== 'web') {
        alert(`Lỗi kết nối Server!\nURL: ${API_URL}\n${error}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const renderItem = ({ item }: { item: Property }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/properties/${item.id}` as any)}
      activeOpacity={0.9} 
    >
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image 
              source={{ uri: item.images[0].url }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageText}>🏠 Không có ảnh</Text>
            </View>
          )}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.type}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.price}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
          </Text>
          <View style={styles.row}>
            <Text style={styles.info}>📍 {item.address}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.info}>📐 {item.area} m²</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sản phẩm mới nhất</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 10, color: '#666' }}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: '#999', marginTop: 50 }}>Chưa có tin đăng nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2563eb',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: '#4b5563',
  },
});