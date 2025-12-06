import { PropertyType } from '@prisma/client';

export class CreatePropertyDto {
  title!: string;
  description?: string;
  address!: string;
  price!: number;
  area!: number;
  contactPhone?: string;
  type?: PropertyType;

  // Thêm trường này: Nhận danh sách URL ảnh từ Frontend
  images?: string[];
}
