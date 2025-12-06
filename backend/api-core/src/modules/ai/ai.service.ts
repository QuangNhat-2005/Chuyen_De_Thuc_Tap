/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // Khởi tạo Gemini với Key từ biến môi trường
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
    });
  }

  async generateDescription(data: any) {
    const prompt = `
      Bạn là một môi giới Bất động sản chuyên nghiệp đăng tin trên trang Batdongsan.com.vn.
      Hãy viết nội dung tin đăng bán dựa trên thông tin sau:
      - Tiêu đề: ${data.title}
      - Địa chỉ: ${data.address}
      - Diện tích: ${data.area} m2
      - Giá: ${data.price} VNĐ
      - Loại hình: ${data.type}
      - Đặc điểm: ${data.description}
      - Liên hệ: ${data.contactPhone} (Gặp ${data.contactName})

      YÊU CẦU BẮT BUỘC:
      1. VÀO THẲNG VẤN ĐỀ, không chào hỏi sáo rỗng.
      2. VĂN PHONG: Gãy gọn, dùng gạch đầu dòng.
      3. CẤU TRÚC: Vị trí - Thông số - Pháp lý - Giá bán.
      4. TUYỆT ĐỐI KHÔNG viết số điện thoại vào trong bài. Chỉ viết câu kêu gọi: "Liên hệ ngay để biết thêm chi tiết và xem nhà"
      5. Viết khoảng 150 chữ.
      6. Không viết :"Tiêu đề..."
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    // Loại bỏ các ký tự markdown thừa
    const cleanText = response
      .text()
      .replace(/\*\*/g, '')
      .replace(/##/g, '')
      .trim();

    return {
      suggestedContent: cleanText,
    };
  }
}
