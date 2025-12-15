// src/common/model/user.model.ts

import { Role } from '@prisma/client'; // Hoặc import từ file enum của bạn

export class UserPayload {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  // Bạn có thể thêm các trường khác nếu JwtStrategy trả về nhiều hơn
}