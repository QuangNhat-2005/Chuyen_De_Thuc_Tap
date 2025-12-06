import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards, // <--- Mới
  Request, // <--- Mới
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import cái khiên vừa tạo

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // API Upload ảnh (Cũng cần bảo vệ)
  @Post('upload')
  @UseGuards(JwtAuthGuard) // <--- Khóa cửa
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.cloudinaryService.uploadImage(file);
  }

  // API Tạo BĐS (Quan trọng nhất)
  @Post()
  @UseGuards(JwtAuthGuard) // <--- Khóa cửa: Phải đăng nhập mới được đăng tin
  create(@Body() createPropertyDto: CreatePropertyDto, @Request() req: any) {
    // req.user chứa thông tin lấy từ Token (do JwtStrategy giải mã)
    const userId = req.user.userId;
    return this.propertiesService.create(createPropertyDto, userId);
  }

  // API Lấy danh sách (Ai xem cũng được -> KHÔNG CẦN GUARD)
  @Get()
  findAll() {
    return this.propertiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard) // <--- Chỉ Admin/Chủ nhà mới được sửa
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) // <--- Chỉ Admin/Chủ nhà mới được xóa
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }
}
