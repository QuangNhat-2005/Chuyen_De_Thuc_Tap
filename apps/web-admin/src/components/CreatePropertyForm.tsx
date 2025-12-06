'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // Import thư viện vừa cài

export default function CreatePropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Kiểm tra đăng nhập khi mở form
  useEffect(() => {
    if (isOpen) {
      const token = Cookies.get('accessToken');
      if (!token) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        router.push('/login');
      }
    }
  }, [isOpen, router]);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    area: '',
    address: '',
    type: 'HOUSE',
    description: '',
    contactPhone: '',
    contactName: ''
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrencyPreview = (value: string) => {
    if (!value) return '';
    const number = Number(value);
    if (isNaN(number)) return 'Số không hợp lệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn! Vui lòng chọn ảnh dưới 5MB');
      return;
    }

    setUploadingImg(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    // Lấy Token từ Cookie
    const token = Cookies.get('accessToken');

    try {
      const res = await fetch('http://localhost:3000/properties/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // <--- Gửi kèm Token
        },
        body: formDataUpload,
      });

      if (res.status === 401) {
        alert('Hết phiên đăng nhập!');
        router.push('/login');
        return;
      }

      const data = await res.json();
      
      if (data.secure_url) {
        setImageUrls(prev => [...prev, data.secure_url]);
      } else {
        alert('Upload thất bại');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi khi upload ảnh!');
    } finally {
      setUploadingImg(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  async function handleGenerateAI() {
    if (!formData.title || !formData.price || !formData.area || !formData.contactPhone || !formData.contactName) {
      alert("Vui lòng nhập đủ: Tiêu đề, Giá, Diện tích, SĐT và Tên liên hệ!");
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch('http://localhost:3000/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          area: Number(formData.area),
        }),
      });
      
      const data = await res.json();
      setFormData(prev => ({ ...prev, description: data.suggestedContent }));
    } catch (error) {
      alert("Lỗi gọi AI: " + error);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Lấy Token từ Cookie
    const token = Cookies.get('accessToken');

    try {
      const res = await fetch('http://localhost:3000/properties', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // <--- Gửi kèm Token
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          area: Number(formData.area),
          contactPhone: formData.contactPhone,
          images: imageUrls,
        }),
      });

      if (res.status === 401) {
        alert('Hết phiên đăng nhập!');
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error('Lỗi khi lưu');

      setFormData({ title: '', price: '', area: '', address: '', type: 'HOUSE', description: '', contactPhone: '', contactName: '' });
      setImageUrls([]);
      setIsOpen(false);
      router.refresh();
      alert('Thêm thành công!');
    } catch (error) {
      alert('Lỗi rồi: ' + error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-105">
        + Đăng tin mới
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Thêm Bất động sản mới</h2>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500">✕ Đóng</button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề tin đăng</label>
          <input name="title" value={formData.title} onChange={handleChange} required placeholder="Ví dụ: Bán nhà mặt tiền Quận 1" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mức giá (VNĐ)</label>
          <input name="price" type="number" value={formData.price} onChange={handleChange} required placeholder="Nhập số tiền..." className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
          {formData.price && <p className="text-sm text-green-600 font-bold mt-1">👉 {formatCurrencyPreview(formData.price)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
          <input name="area" type="number" value={formData.area} onChange={handleChange} required placeholder="100" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
          <input name="address" value={formData.address} onChange={handleChange} required placeholder="Số 123, Đường ABC..." className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} required placeholder="0909 xxx xxx" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên liên hệ</label>
          <input name="contactName" value={formData.contactName} onChange={handleChange} required placeholder="Anh Nam, Chị Lan..." className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại hình</label>
          <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900">
            <option value="HOUSE">Nhà riêng</option>
            <option value="APARTMENT">Chung cư</option>
            <option value="LAND">Đất nền</option>
            <option value="COMMERCIAL">Văn phòng/Kiot</option>
          </select>
        </div>

        <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh thực tế</label>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              disabled={uploadingImg}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadingImg && <span className="text-blue-600 text-sm animate-pulse">Đang tải lên...</span>}
          </div>
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img src={url} alt="Preview" className="w-full h-24 object-cover rounded-md border border-gray-200" />
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-2 relative">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
            <button type="button" onClick={handleGenerateAI} disabled={aiLoading} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold hover:bg-purple-200 transition flex items-center gap-1">
              {aiLoading ? '🤖 Đang viết...' : '✨ Dùng AI viết mô tả'}
            </button>
          </div>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={6} placeholder="Bấm nút AI ở trên để tự động viết..." className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
        </div>

        <div className="col-span-2 mt-2">
          <button type="submit" disabled={loading || uploadingImg} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400">
            {loading ? 'Đang lưu...' : 'Lưu tin đăng'}
          </button>
        </div>
      </form>
    </div>
  );
}