import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  // 1. Tạo bất động sản mới (Nhận thêm userId)
  async create(createPropertyDto: CreatePropertyDto, userId: string) {
    // KHÔNG CÒN TẠO USER GIẢ NỮA -> Dùng userId thật

    return this.prisma.property.create({
      data: {
        title: createPropertyDto.title,
        description: createPropertyDto.description,
        address: createPropertyDto.address,
        price: createPropertyDto.price,
        area: createPropertyDto.area,
        type: createPropertyDto.type || 'HOUSE',
        contactPhone: createPropertyDto.contactPhone,

        // Gán đúng chủ sở hữu (người đang đăng nhập)
        agentId: userId,

        images: {
          create: createPropertyDto.images?.map((url) => ({
            url: url,
          })),
        },
      },
      include: {
        images: true,
      },
    });
  }

  // ... (Các hàm findAll, findOne, update, remove GIỮ NGUYÊN như cũ)
  // Bạn chỉ cần copy lại phần create ở trên thay vào, hoặc copy full file cũ rồi sửa hàm create là được.
  // Để an toàn, tôi viết lại full các hàm dưới đây cho bạn copy 1 lần:

  findAll() {
    return this.prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      include: { images: true },
    });
  }

  findOne(id: string) {
    return this.prisma.property.findUnique({
      where: { id },
      include: { images: true, agent: true },
    });
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    const { images, ...propertyData } = updatePropertyDto;
    return this.prisma.property.update({
      where: { id },
      data: {
        ...propertyData,
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((url) => ({ url })),
          },
        }),
      },
    });
  }

  async remove(id: string) {
    return this.prisma.property.delete({
      where: { id },
    });
  }
}
