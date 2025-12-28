// prisma/seed.ts

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu tạo dữ liệu mẫu...');

  // 1. XÓA DỮ LIỆU CŨ (Để tránh trùng lặp khi chạy lại)
  // Thứ tự xóa quan trọng để tránh lỗi khóa ngoại (Foreign Key)
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Đã xóa sạch dữ liệu cũ.');

  // 2. TẠO USER (Mật khẩu chung là: 123456)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('123456', salt);

  // --- Tạo Admin ---
  await prisma.user.create({
    data: {
      email: 'admin@craftviet.com',
      password: passwordHash,
      fullName: 'Quản Trị Viên',
      role: Role.ADMIN,
    },
  });

  // --- Tạo Sellers (Chủ shop) ---
  const seller1 = await prisma.user.create({
    data: {
      email: 'nghe_nhan_gom@gmail.com',
      password: passwordHash,
      fullName: 'Nghệ Nhân Lê Văn Gốm',
      role: Role.SELLER,
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'co_ba_lua@gmail.com',
      password: passwordHash,
      fullName: 'Cô Ba Lụa',
      role: Role.SELLER,
    },
  });

  const seller3 = await prisma.user.create({
    data: {
      email: 'chu_tu_tre@gmail.com',
      password: passwordHash,
      fullName: 'Chú Tư Tre',
      role: Role.SELLER,
    },
  });

  // --- Tạo Buyers (Khách hàng) ---
  const buyer1 = await prisma.user.create({
    data: {
      email: 'khachhang1@gmail.com',
      password: passwordHash,
      fullName: 'Nguyễn Văn Mua',
      role: Role.BUYER,
    },
  });

  console.log('👤 Đã tạo xong Users.');

  // 3. TẠO SHOPS (Kèm câu chuyện làng nghề)
  
  // Shop 1: Gốm Bát Tràng
  const shopGom = await prisma.shop.create({
    data: {
      ownerId: seller1.id,
      name: 'Gốm Xưa Bát Tràng',
      // THÊM:
      villageName: 'Bát Tràng', 
      description: 'Gìn giữ tinh hoa gốm Việt...',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2070&auto=format&fit=crop',
      coverUrl: 'https://images.unsplash.com/photo-1565193566173-0929d995e80c?q=80&w=2070&auto=format&fit=crop',
    },
  });

  const shopLua = await prisma.shop.create({
    data: {
      ownerId: seller2.id,
      name: 'Lụa Tơ Tằm Hà Đông',
      // THÊM:
      villageName: 'Vạn Phúc',
      description: 'Nơi dệt nên những dải lụa mềm mại...',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1629196914168-3a9644338cf5?q=80&w=2070&auto=format&fit=crop',
      coverUrl: 'https://images.unsplash.com/photo-1528459199957-0ff28096a7e6?q=80&w=2069&auto=format&fit=crop',
    },
  });

  const shopTre = await prisma.shop.create({
    data: {
      ownerId: seller3.id,
      name: 'Mây Tre Phú Vinh',
      // THÊM:
      villageName: 'Phú Vinh',
      description: 'Sản phẩm thân thiện môi trường...',
      isVerified: false,
      avatarUrl: 'https://plus.unsplash.com/premium_photo-1664304899532-349f2b84f3df?q=80&w=2070&auto=format&fit=crop',
      coverUrl: 'https://images.unsplash.com/photo-1519643381401-22c77e60520e?q=80&w=2073&auto=format&fit=crop',
    },
  });

  console.log('uD83CuDFEA Đã tạo xong Shops.');

  // 4. TẠO PRODUCTS (Sản phẩm mẫu)

  // --- Sản phẩm Gốm ---
  await prisma.product.create({
    data: {
      shopId: shopGom.id,
      name: 'Bình Hoa Men Lam Cổ',
      description: 'Bình hoa dáng tỏi, vẽ họa tiết hoa sen dây. Men lam sắc nét, nung ở nhiệt độ 1300 độ C loại bỏ hoàn toàn tạp chất.',
      price: 550000,
      stockQuantity: 20,
      category: 'Gốm sứ',
      material: 'Đất sét trắng',
      origin: 'Bát Tràng',
      images: [
        'https://images.unsplash.com/photo-1578749556935-ef3893fb8d6c?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2070&auto=format&fit=crop'
      ],
      reviews: {
        create: [
          { userId: buyer1.id, rating: 5, comment: 'Bình rất đẹp, men sáng bóng, đóng gói kỹ.' },
        ]
      }
    },
  });

  await prisma.product.create({
    data: {
      shopId: shopGom.id,
      name: 'Bộ Ấm Chén Tử Sa',
      description: 'Bộ ấm chén đất tử sa giữ nhiệt tốt, lưu hương trà lâu. Phù hợp cho người sành trà.',
      price: 1200000,
      stockQuantity: 10,
      category: 'Gốm sứ',
      material: 'Đất Tử Sa',
      origin: 'Bát Tràng',
      images: [
        'https://images.unsplash.com/photo-1550953041-0775d78a995e?q=80&w=2070&auto=format&fit=crop'
      ]
    },
  });

  // --- Sản phẩm Lụa ---
  await prisma.product.create({
    data: {
      shopId: shopLua.id,
      name: 'Khăn Choàng Lụa Sen',
      description: 'Khăn lụa tơ tằm thêu tay hoa sen. Mềm mại, mát vào mùa hè, ấm vào mùa đông.',
      price: 850000,
      stockQuantity: 50,
      category: 'Thời trang',
      material: 'Lụa tơ tằm',
      origin: 'Vạn Phúc',
      images: [
        'https://images.unsplash.com/photo-1606504547901-4470d069c94b?q=80&w=2070&auto=format&fit=crop',
      ]
    },
  });

  // --- Sản phẩm Tre ---
  await prisma.product.create({
    data: {
      shopId: shopTre.id,
      name: 'Đèn Lồng Tre Thả Trần',
      description: 'Đèn lồng đan thủ công, tạo hiệu ứng ánh sáng ấm áp cho phòng khách hoặc quán cafe.',
      price: 350000,
      stockQuantity: 100,
      category: 'Trang trí nhà cửa',
      material: 'Tre già',
      origin: 'Phú Vinh',
      images: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop',
      ],
      reviews: {
        create: [
          { userId: buyer1.id, rating: 4, comment: 'Đèn đẹp nhưng dây treo hơi ngắn.' },
        ]
      }
    },
  });

  console.log('📦 Đã tạo xong Products.');
  console.log('✅ SEEDING HOÀN TẤT!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });