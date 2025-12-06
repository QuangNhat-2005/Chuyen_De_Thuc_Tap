import CreatePropertyForm from "@/components/CreatePropertyForm";
import Link from "next/link";

// 1. Định nghĩa kiểu dữ liệu (Thêm images)
interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  area: number;
  type: string;
  images?: { url: string }[]; // Mảng ảnh từ Backend
}

// 2. Hàm lấy dữ liệu từ Backend
async function getProperties(): Promise<Property[]> {
  try {
    const res = await fetch('http://localhost:3000/properties', {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }

    return res.json();
  } catch (error) {
    console.error("Lỗi kết nối Backend:", error);
    return [];
  }
}

export default async function Home() {
  const properties = await getProperties();

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Quản Lý
            </h1>
            <p className="text-gray-500 mt-1">Hệ thống quản lý Bất động sản tập trung</p>
          </div>
          <CreatePropertyForm />
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-lg">Chưa có dữ liệu nào.</p>
            <p className="text-sm text-gray-400">Hãy bấm nút Đăng tin mới để thêm dữ liệu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <Link 
                href={`/properties/${prop.id}`} 
                key={prop.id} 
                className="block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer group"
              >
                {/* --- LOGIC HIỂN THỊ ẢNH --- */}
                <div className="h-48 relative bg-gray-100">
                  {prop.images && prop.images.length > 0 ? (
                    <img 
                      src={prop.images[0].url} 
                      alt={prop.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                      <span>Không có ảnh</span>
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700 uppercase tracking-wider shadow-sm">
                    {prop.type}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-1 flex-1 mr-2" title={prop.title}>
                      {prop.title}
                    </h2>
                  </div>

                  <p className="text-blue-600 font-bold text-xl mb-3">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prop.price)}
                  </p>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
                    {prop.description}
                  </p>

                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>📍</span>
                      <span className="truncate max-w-[120px]" title={prop.address}>{prop.address}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-gray-700">
                      <span>📐</span>
                      <span>{prop.area} m²</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}