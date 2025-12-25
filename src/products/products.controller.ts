import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, 
  ParseIntPipe, 
  UseInterceptors,
  BadRequestException,
  UploadedFiles
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger'; // Import
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('products') // 1. Gom nhóm API trong UI
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm mới' }) // 2. Mô tả API làm gì
  @ApiResponse({ status: 201, description: 'Tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm (có lọc & phân trang)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách sản phẩm.' })
  findAll(@Query() query: FilterProductDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một sản phẩm' })
  @ApiResponse({ status: 200, description: 'Tìm thấy sản phẩm.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin sản phẩm' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Post(':id/upload-images')
  @ApiOperation({ summary: 'Upload nhiều ảnh cho sản phẩm' })
  @ApiConsumes('multipart/form-data') // Bắt buộc để Swagger hiện nút upload file
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array', // Upload nhiều file
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, { // 'files' là tên field trong form-data, max 10 ảnh
      storage: diskStorage({
        destination: './uploads/products', // Thư mục lưu (Tự động tạo nếu chưa có)
        filename: (req, file, callback) => {
          // Đổi tên file để tránh trùng lặp: timestamp + đuôi file gốc
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Chỉ cho phép ảnh
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Chỉ chấp nhận file ảnh!'), false);
        }
        callback(null, true);
      },
    }),
  )
  uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Array<Express.Multer.File>, // Lấy file từ Interceptor
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một file ảnh');
    }
    return this.productsService.uploadImages(id, files);
  }
}