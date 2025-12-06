import Link from "next/link";
import ImageGallery from "@/components/ImageGallery"; // Import Component vừa tạo
import PropertyActions from "@/components/PropertyActions";
async function getPropertyDetail(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/properties/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Lỗi kết nối:", error);
    return null;
  }
}

export default async function PropertyDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params; 
  const property = await getPropertyDetail(params.id);

  if (!property) {
    return <div className="p-10 text-center text-red-500">Không tìm thấy bất động sản này! (ID: {params.id})</div>;
  }

  // Lấy danh sách ảnh
  const images = property.images || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* --- THAY THẾ PHẦN CŨ BẰNG COMPONENT MỚI --- */}
        <div className="p-1">
           <ImageGallery images={images} />
        </div>
        {/* ------------------------------------------- */}

        <div className="p-8">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block font-medium">
            ← Quay lại danh sách
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {property.type}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-3 leading-tight">{property.title}</h1>
              <p className="text-gray-500 mt-2 flex items-center gap-1">
                📍 {property.address}
              </p>
            </div>
            <div className="text-left md:text-right bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[200px]">
              <p className="text-3xl font-bold text-blue-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(property.price)}
              </p>
              <p className="text-gray-500 font-medium mt-1">Diện tích: {property.area} m²</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cột trái: Thông tin chi tiết */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Mô tả chi tiết</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-6 rounded-xl border border-gray-100">
                  {property.description}
                </div>
              </div>
            </div>

            {/* Cột phải: Liên hệ */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Liên hệ người bán</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                    👤
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Môi giới / Chủ nhà</p>
                    <p className="font-bold text-gray-900">Admin Estate</p>
                  </div>
                </div>
                
                <a 
                  href={`tel:${property.contactPhone}`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-bold transition mb-2"
                >
                  📞 {property.contactPhone || "0909 *** ***"}
                </a>
                <button className="block w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 text-center py-3 rounded-lg font-bold transition">
                  💬 Chat Zalo
                </button>
              </div>

              <div className="flex gap-2">
                <PropertyActions id={property.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}