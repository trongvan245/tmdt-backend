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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger'; 
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from 'src/auth/public.decorator';

@ApiTags('products') 
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo sản phẩm mới' }) 
  @ApiResponse({ status: 201, description: 'Tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Public() // Đã có sẵn
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm (có lọc & phân trang) (Public)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách sản phẩm.' })
  findAll(@Query() query: FilterProductDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Public() // --- THÊM MỚI ---
  @ApiOperation({ summary: 'Lấy chi tiết một sản phẩm (Public)' }) // --- UPDATE TEXT ---
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
  @ApiConsumes('multipart/form-data') 
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array', 
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, { 
      storage: diskStorage({
        destination: './uploads/products', 
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Chỉ chấp nhận file ảnh!'), false);
        }
        callback(null, true);
      },
    }),
  )
  uploadImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Array<Express.Multer.File>, 
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một file ảnh');
    }
    return this.productsService.uploadImages(id, files);
  }

  @Get('shop/:shopId')
  @Public() // --- THÊM MỚI ---
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm của một Shop (Có phân trang) (Public)' }) // --- UPDATE TEXT ---
  @ApiResponse({ status: 200, description: 'Trả về danh sách sản phẩm.' })
  findByShop(
    @Param('shopId', ParseIntPipe) shopId: number,
    @Query('page') page?: number,  
    @Query('limit') limit?: number, 
  ) {
    const pageNumber = page ? Number(page) : 1;
    const limitNumber = limit ? Number(limit) : 10;

    return this.productsService.findByShop(shopId, pageNumber, limitNumber);
  }
}