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

  console.log('📝 Đang tạo dữ liệu Blog...');

  const blogsData = [
    {
      title: 'Lịch sử 500 năm làng gốm Bát Tràng',
      slug: 'lich-su-500-nam-lang-gom-bat-trang',
      description: 'Khám phá hành trình hơn 5 thế kỷ phát triển của làng nghề gốm sứ nổi tiếng nhất Việt Nam, từ những lò gốm đầu tiên đến ngày nay.',
      tags: ['Lịch sử'],
      coverUrl: 'https://placehold.co/600x400?text=Lich+Su+Bat+Trang',
      // Update theo ảnh: 15/11/2024 - 8 phút đọc
      createdAt: new Date('2024-11-15T08:00:00Z'),
      readingTime: '8 phút đọc',
      content: `
# Hành trình 5 thế kỷ

Làng gốm Bát Tràng nằm bên tả ngạn sông Hồng... (Nội dung rút gọn)
      `
    },
    {
      title: 'Quy trình làm gốm truyền thống',
      slug: 'quy-trinh-lam-gom-truyen-thong',
      description: 'Tìm hiểu 7 bước cơ bản trong quy trình sản xuất gốm Bát Tràng, từ chọn đất, nặn, trang trí cho đến nung và hoàn thiện sản phẩm.',
      tags: ['Nghề thủ công'],
      coverUrl: 'https://placehold.co/600x400?text=Quy+Trinh+Lam+Gom',
      // Update theo ảnh: 12/11/2024 - 10 phút đọc
      createdAt: new Date('2024-11-12T09:00:00Z'),
      readingTime: '10 phút đọc',
      content: `
# 7 Bước làm gốm tinh xảo

Để tạo ra một sản phẩm gốm Bát Tràng hoàn chỉnh... (Nội dung rút gọn)
      `
    },
    {
      title: 'Lò nung gốm - Trái tim của làng nghề',
      slug: 'lo-nung-gom-trai-tim-cua-lang-nghe',
      description: 'Lò bầu cổ truyền thống và lò gas hiện đại - Sự kết hợp hoàn hảo giữa truyền thống và công nghệ trong làng gốm Bát Tràng.',
      tags: ['Công nghệ'],
      coverUrl: 'https://placehold.co/600x400?text=Lo+Nung+Gom',
      // Update theo ảnh: 08/11/2024 - 6 phút đọc
      createdAt: new Date('2024-11-08T10:30:00Z'),
      readingTime: '6 phút đọc',
      content: `
# Sự chuyển mình của công nghệ nung

Lò nung được ví như "trái tim" quyết định sự thành bại... (Nội dung rút gọn)
      `
    },
    {
      title: 'Nghệ nhân nổi tiếng của Bát Tràng',
      slug: 'nghe-nhan-noi-tieng-cua-bat-trang',
      description: 'Gặp gỡ các bậc thầy gốm sứ, những người đã cống hiến cả đời cho nghề và được vinh danh với danh hiệu Nghệ nhân nhân dân.',
      tags: ['Con người'],
      coverUrl: 'https://placehold.co/600x400?text=Nghe+Nhan',
      // Update theo ảnh: 05/11/2024 - 7 phút đọc
      createdAt: new Date('2024-11-05T14:00:00Z'),
      readingTime: '7 phút đọc',
      content: `
# Những bàn tay vàng

Bát Tràng là nơi sản sinh ra nhiều nghệ nhân tài hoa nhất... (Nội dung rút gọn)
      `
    },
    {
      title: 'Nghệ thuật vẽ hoa văn trên gốm',
      slug: 'nghe-thuat-ve-hoa-van-tren-gom',
      description: 'Khám phá các họa tiết truyền thống Việt Nam và kỹ thuật vẽ tay tinh xảo tạo nên vẻ đẹp độc đáo cho sản phẩm gốm Bát Tràng.',
      tags: ['Nghệ thuật'],
      coverUrl: 'https://placehold.co/600x400?text=Ve+Hoa+Van',
      // Update theo ảnh: 01/11/2024 - 9 phút đọc
      createdAt: new Date('2024-11-01T15:45:00Z'),
      readingTime: '9 phút đọc',
      content: `
# Nét bút trên đất

Khác với gốm sứ công nghiệp in decal, gốm Bát Tràng... (Nội dung rút gọn)
      `
    },
    {
      title: 'Trải nghiệm làm gốm tại Bát Tràng',
      slug: 'trai-nghiem-lam-gom-tai-bat-trang',
      description: 'Hướng dẫn chi tiết để du khách có thể tự tay nặn và trang trí sản phẩm gốm của riêng mình khi đến thăm làng nghề.',
      tags: ['Du lịch'],
      coverUrl: 'https://placehold.co/600x400?text=Trai+Nghiem+Lam+Gom',
      // Update theo ảnh: 28/10/2024 - 5 phút đọc
      createdAt: new Date('2024-10-28T08:15:00Z'),
      readingTime: '5 phút đọc',
      content: `
# Một ngày làm thợ gốm

Nếu bạn ghé thăm Bát Tràng cuối tuần, đừng bỏ qua... (Nội dung rút gọn)
      `
    },
  ];

  for (const blog of blogsData) {
    await prisma.blog.create({
      data: {
        shopId: shopGom.id,
        title: blog.title,
        slug: blog.slug,
        description: blog.description,
        content: blog.content,
        coverUrl: blog.coverUrl,
        tags: blog.tags,
        isPublished: true,
        // Ghi đè thông tin ngày tháng và thời gian đọc
        createdAt: blog.createdAt, 
        readingTime: blog.readingTime,
      },
    });
  }

  console.log(`✅ Đã tạo xong ${blogsData.length} bài Blog với ngày tháng tùy chỉnh.`);

  
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