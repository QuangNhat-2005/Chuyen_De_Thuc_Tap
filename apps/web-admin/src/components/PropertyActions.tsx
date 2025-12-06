'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useState } from 'react';

export default function PropertyActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin này không? Hành động này không thể hoàn tác!')) return;

    setLoading(true);
    const token = Cookies.get('accessToken');

    try {
      const res = await fetch(`http://localhost:3000/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Phiên đăng nhập hết hạn');
        if (res.status === 403) throw new Error('Bạn không có quyền xóa tin này');
        throw new Error('Lỗi khi xóa');
      }

      alert('Đã xóa thành công!');
      router.push('/'); // Quay về trang chủ
      router.refresh(); // Làm mới dữ liệu
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 mt-8">
      <button
        onClick={() => router.push(`/properties/${id}/edit`)}
        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
      >
        ✏️ Sửa tin
      </button>
      
      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex-1 bg-white text-red-600 py-3 rounded-lg font-bold hover:bg-red-50 transition border border-red-200 shadow-sm"
      >
        {loading ? 'Đang xóa...' : '🗑️ Xóa tin'}
      </button>
    </div>
  );
}