import { 
  Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe, 
  Query,
  UploadedFiles,
  BadRequestException,
  UseInterceptors
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Giả sử bạn đã có Guard này
import { CurrentUser } from 'src/common/decorator/user.decorator';
import { UserPayload } from 'src/common/model/user.model';
import { FilterShopDto } from './dto/filter-shop.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/public.decorator';

@ApiTags('shops')
@ApiBearerAuth()
@Controller('shops')

export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard) // Bắt buộc phải đăng nhập mới được tạo shop
  @ApiOperation({ summary: 'Đăng ký trở thành người bán (Tạo Shop)' })
  @ApiResponse({ status: 201, description: 'Tạo cửa hàng thành công.' })
  @ApiResponse({ status: 400, description: 'User đã có cửa hàng.' })
  create(
    @CurrentUser() user: UserPayload, // <--- Dùng Decorator xịn ở đây
    @Body() createShopDto: CreateShopDto
  ) {
    // user.id lấy trực tiếp từ Token đã decode
    return this.shopsService.create(user.id, createShopDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xem thông tin shop của tôi' })
  findMyShop(@CurrentUser() user: UserPayload) {
    console.log(`User ${user.email} đang xem shop của mình`);
    return this.shopsService.findMyShop(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin shop của tôi' })
  update(
    @CurrentUser() user: UserPayload, 
    @Body() updateShopDto: UpdateShopDto
  ) {
    return this.shopsService.update(user.id, updateShopDto);
  }

  // API này Public (không cần login) để khách xem hàng
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Xem thông tin shop bất kỳ (Public)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shopsService.findOne(id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách cửa hàng (Có tìm kiếm & sắp xếp) (Public)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách cửa hàng.' })
  findAll(@Query() query: FilterShopDto) {
    return this.shopsService.findAll(query);
  }

  @Patch('me/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật Avatar và Ảnh bìa cho Shop' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh đại diện (jpg, png)',
        },
        cover: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh bìa (jpg, png)',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: diskStorage
        ({
          destination: './uploads/shops', // Lưu vào thư mục shops
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            return cb(new BadRequestException('Chỉ chấp nhận file ảnh!'), false);
          }
          cb(null, true);
        },
      },
    ),
  )
  updateImages(
    @CurrentUser() user: UserPayload,
    @UploadedFiles() files: { avatar?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    // files sẽ có dạng: { avatar: [File...], cover: [File...] }
    const avatar = files.avatar ? files.avatar[0] : undefined;
    const cover = files.cover ? files.cover[0] : undefined;

    if (!avatar && !cover) {
      throw new BadRequestException('Vui lòng upload ít nhất một ảnh (avatar hoặc cover)');
    }

    return this.shopsService.updateShopImages(user.id, avatar, cover);
  }
}