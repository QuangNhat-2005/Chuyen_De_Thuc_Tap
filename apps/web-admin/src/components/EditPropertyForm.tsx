'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function EditPropertyForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData.title,
    price: initialData.price,
    area: initialData.area,
    address: initialData.address,
    type: initialData.type,
    description: initialData.description,
    contactPhone: initialData.contactPhone || '',
    contactName: initialData.contactName || ''
  });

  // Hàm format tiền tệ (VNĐ) để xem trước
  const formatCurrencyPreview = (value: any) => {
    if (!value) return '';
    const number = Number(value);
    if (isNaN(number)) return 'Số không hợp lệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = Cookies.get('accessToken');

    try {
      const res = await fetch(`http://localhost:3000/properties/${initialData.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          area: Number(formData.area),
        }),
      });

      if (!res.ok) throw new Error('Lỗi khi cập nhật');

      alert('Cập nhật thành công!');
      router.push(`/properties/${initialData.id}`);
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Class chung cho các ô input để chữ màu đen, nền trắng
  const inputClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Chỉnh sửa tin đăng</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
          <input 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            className={inputClass} 
          />
        </div>

        {/* --- PHẦN GIÁ CÓ PREVIEW --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
          <input 
            name="price" 
            type="number" 
            value={formData.price} 
            onChange={handleChange} 
            className={inputClass} 
          />
          {/* Dòng hiển thị số tiền bằng chữ/format */}
          {formData.price && (
            <p className="text-sm text-green-600 font-bold mt-1">
              👉 {formatCurrencyPreview(formData.price)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m2)</label>
          <input 
            name="area" 
            type="number" 
            value={formData.area} 
            onChange={handleChange} 
            className={inputClass} 
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
          <input 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            className={inputClass} 
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Loại hình</label>
          <select 
            name="type" 
            value={formData.type} 
            onChange={handleChange} 
            className={inputClass}
          >
            <option value="HOUSE">Nhà riêng</option>
            <option value="APARTMENT">Chung cư</option>
            <option value="LAND">Đất nền</option>
            <option value="COMMERCIAL">Văn phòng/Kiot</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea 
            name="description" 
            rows={8} 
            value={formData.description} 
            onChange={handleChange} 
            className={inputClass} 
          />
        </div>

        <div className="col-span-2 mt-4 flex gap-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded font-bold hover:bg-gray-200 transition"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </form>
  );
}