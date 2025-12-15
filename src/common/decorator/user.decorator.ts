// src/common/decorator/user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../model/user.model';

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Nếu người dùng chỉ muốn lấy 1 trường cụ thể (ví dụ @CurrentUser('id'))
    if (data) {
      return user ? user[data] : undefined;
    }

    // Mặc định trả về cả object User
    return user as UserPayload;
  },
);