import { 
  Controller, Get, Patch, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorator/user.decorator';
import { UserPayload } from '../common/model/user.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // API lấy thông tin cá nhân (để test xem có avatar chưa)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin cá nhân' })
  getProfile(@CurrentUser() user: UserPayload) {
    return this.usersService.findOne(user.id); // Bạn tự đảm bảo hàm findOne này có trong service nhé
  }

  // API Update Profile
  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân & Avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', nullable: true },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh avatar (jpg, png)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', { // Key trong form-data là 'avatar'
      storage: diskStorage({
        destination: './uploads/users', // Lưu vào folder users
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `user-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Chỉ chấp nhận file ảnh!'), false);
        }
        cb(null, true);
      },
    }),
  )
  updateProfile(
    @CurrentUser() user: UserPayload,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(user.id, updateUserDto, avatar);
  }
}