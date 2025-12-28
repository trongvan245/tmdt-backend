import { 
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe 
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FilterBlogDto } from './dto/filter-blog.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserPayload } from 'src/common/model/user.model';
import { CurrentUser } from 'src/common/decorator/user.decorator';

@ApiTags('blogs')
@Controller('blogs')
@ApiBearerAuth()
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo bài blog mới (Seller)' })
  create(@CurrentUser() user: UserPayload, @Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(user.id, createBlogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách bài viết (Public - Có lọc theo tag, shop, tên)' })
  findAll(@Query() query: FilterBlogDto) {
    console.log('Lấy danh sách blog với filter:', query);
    return this.blogsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết bài viết' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blogsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sửa bài viết (Seller)' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @CurrentUser() user: UserPayload,
    @Body() updateBlogDto: UpdateBlogDto
  ) {
    return this.blogsService.update(id, user.id, updateBlogDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa bài viết (Seller)' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserPayload) {
    return this.blogsService.remove(id, user.id);
  }
}