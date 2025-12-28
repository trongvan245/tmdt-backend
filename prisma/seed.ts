// prisma/seed.ts

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// --- 1. CẤU HÌNH RANDOM CỐ ĐỊNH (DETERMINISTIC RANDOM) ---

// Thuật toán Mulberry32: Tạo số ngẫu nhiên có Seed
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Khởi tạo hàm random với seed cố định
const seed = 54321; 
const random = mulberry32(seed);

// Hàm lấy số nguyên trong khoảng min-max
function getSeededRandomInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

// Hàm tạo slug
function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           
    .replace(/[^\w\-]+/g, '')       
    .replace(/\-\-+/g, '-')         
    .replace(/^-+/, '')             
    .replace(/-+$/, '') + '-1700000000'; // Timestamp giả cố định
}

async function main() {
  console.log('🌱 Bắt đầu tạo dữ liệu mẫu (Seeded Mode)...');

  // XÓA DỮ LIỆU CŨ
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.blog.deleteMany(); 
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Đã xóa sạch dữ liệu cũ.');

  // TẠO PASSWORD HASH (Mật khẩu chung: 123456)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('123456', salt);

  // TẠO ADMIN
  await prisma.user.create({
    data: { email: 'admin@craftviet.com', password: passwordHash, fullName: 'Quản Trị Viên', role: Role.ADMIN },
  });

  // TẠO SELLERS
  const sellers = [];
  const sellersData = [
    { email: 'nghe_nhan_gom@gmail.com', name: 'Nghệ Nhân Lê Văn Gốm' }, 
    { email: 'seller_lua@gmail.com', name: 'Cô Ba Lụa' },               
    { email: 'seller_tre@gmail.com', name: 'Chú Tư Tre' },              
    { email: 'seller_go@gmail.com', name: 'Bác Năm Mộc' },              
    { email: 'seller_sonmai@gmail.com', name: 'Họa Sĩ Hạ Thái' },       
    { email: 'seller_dong@gmail.com', name: 'Anh Sáu Đồng' },           
    { email: 'seller_da@gmail.com', name: 'Chị Bảy Non Nước' },         
    { email: 'seller_theu@gmail.com', name: 'Cô Tám Thêu' },            
    { email: 'seller_tranh@gmail.com', name: 'Nghệ Nhân Đông Hồ' },     
    { email: 'seller_coi@gmail.com', name: 'Dì Chín Cói' },             
  ];

  for (const s of sellersData) {
    const user = await prisma.user.create({
      data: { email: s.email, password: passwordHash, fullName: s.name, role: Role.SELLER },
    });
    sellers.push(user);
  }
  
  // TẠO BUYERS
  const buyers = [];
  const buyersData = [
    { email: 'khachhang1@gmail.com', name: 'Nguyễn Văn Mua' },
    { email: 'khachhang2@gmail.com', name: 'Trần Thị Sắm' },
  ];
  
  for (const b of buyersData) {
    const user = await prisma.user.create({ 
      data: { email: b.email, password: passwordHash, fullName: b.name, role: Role.BUYER } 
    });
    buyers.push(user);
  }

  console.log(`👤 Đã tạo xong Users.`);

  // TẠO SHOPS
  const shopsData = [
    { ownerIdx: 0, name: 'Gốm Xưa Bát Tràng', village: 'Bát Tràng, Hà Nội', img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=2070', desc: 'Tinh hoa gốm Việt ngàn năm.' },
    { ownerIdx: 1, name: 'Lụa Tơ Tằm Hà Đông', village: 'Vạn Phúc, Hà Đông', img: 'https://images.unsplash.com/photo-1629196914168-3a9644338cf5?q=80&w=2070', desc: 'Lụa mềm mại, dệt thủ công.' },
    { ownerIdx: 2, name: 'Mây Tre Phú Vinh', village: 'Phú Vinh, Chương Mỹ', img: 'https://plus.unsplash.com/premium_photo-1664304899532-349f2b84f3df?q=80&w=2070', desc: 'Sản phẩm xanh cho cuộc sống xanh.' },
    { ownerIdx: 3, name: 'Đồ Gỗ Đồng Kỵ', village: 'Đồng Kỵ, Bắc Ninh', img: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?q=80&w=2070', desc: 'Đồ gỗ mỹ nghệ chạm khắc tinh xảo.' },
    { ownerIdx: 4, name: 'Sơn Mài Hạ Thái', village: 'Hạ Thái, Thường Tín', img: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?q=80&w=2070', desc: 'Nghệ thuật sơn mài truyền thống.' },
    { ownerIdx: 5, name: 'Đúc Đồng Đại Bái', village: 'Đại Bái, Bắc Ninh', img: 'https://images.unsplash.com/photo-1536622471676-e10693240292?q=80&w=2070', desc: 'Đồ thờ cúng và tượng đồng cao cấp.' },
    { ownerIdx: 6, name: 'Đá Mỹ Nghệ Non Nước', village: 'Non Nước, Đà Nẵng', img: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070', desc: 'Điêu khắc đá nghệ thuật.' },
    { ownerIdx: 7, name: 'Thêu Tay Quất Động', village: 'Quất Động, Thường Tín', img: 'https://images.unsplash.com/photo-1622396636133-743013d5b1b9?q=80&w=2070', desc: 'Tranh thêu tay tỉ mỉ từng đường kim.' },
    { ownerIdx: 8, name: 'Tranh Dân Gian Đông Hồ', village: 'Song Hồ, Thuận Thành', img: 'https://images.unsplash.com/photo-1583853272268-07d0d0f796bd?q=80&w=2070', desc: 'Màu dân tộc sáng bừng trên giấy điệp.' },
    { ownerIdx: 9, name: 'Chiếu Cói Kim Sơn', village: 'Kim Sơn, Ninh Bình', img: 'https://images.unsplash.com/photo-1605646399084-2e213348006e?q=80&w=2070', desc: 'Chiếu cói bền đẹp, thoáng mát.' },
  ];

  const createdShops = [];
  for (const s of shopsData) {
    const shop = await prisma.shop.create({
      data: {
        ownerId: sellers[s.ownerIdx].id,
        name: s.name,
        villageName: s.village,
        description: s.desc,
        isVerified: true,
        avatarUrl: s.img,
        coverUrl: s.img,
      },
    });
    createdShops.push(shop);
  }

  console.log(`🏪 Đã tạo xong Shops.`);

  // TẠO PRODUCTS
  const productsData = [
    // Gốm (Shop 0)
    { shopIdx: 0, name: 'Bình Hoa Men Lam Cổ', cat: 'Gốm sứ', price: 550000, stock: 20 },
    { shopIdx: 0, name: 'Bộ Ấm Chén Tử Sa', cat: 'Gốm sứ', price: 1200000, stock: 10 },
    { shopIdx: 0, name: 'Lọ Lộc Bình Phong Thủy', cat: 'Gốm sứ', price: 2500000, stock: 5 },
    // Lụa (Shop 1)
    { shopIdx: 1, name: 'Khăn Choàng Lụa Sen', cat: 'Thời trang', price: 850000, stock: 50 },
    { shopIdx: 1, name: 'Áo Dài Lụa Tơ Tằm', cat: 'Thời trang', price: 3500000, stock: 15 },
    // Tre (Shop 2)
    { shopIdx: 2, name: 'Đèn Lồng Tre Thả Trần', cat: 'Trang trí', price: 350000, stock: 100 },
    { shopIdx: 2, name: 'Giỏ Mây Picnic Vintage', cat: 'Phụ kiện', price: 250000, stock: 40 },
    // Gỗ (Shop 3)
    { shopIdx: 3, name: 'Tượng Di Lặc Gỗ Hương', cat: 'Đồ gỗ', price: 4500000, stock: 3 },
    { shopIdx: 3, name: 'Khay Trà Gỗ Trắc', cat: 'Đồ gỗ', price: 1800000, stock: 8 },
    { shopIdx: 3, name: 'Hộp Đựng Trang Sức Gỗ', cat: 'Đồ gỗ', price: 600000, stock: 20 },
    // Sơn Mài (Shop 4)
    { shopIdx: 4, name: 'Tranh Sơn Mài Tứ Quý', cat: 'Tranh nghệ thuật', price: 8000000, stock: 2 },
    { shopIdx: 4, name: 'Bình Hoa Sơn Mài Cẩn Trứng', cat: 'Trang trí', price: 1500000, stock: 10 },
    // Đồng (Shop 5)
    { shopIdx: 5, name: 'Lư Xông Trầm Bằng Đồng', cat: 'Đồ thờ', price: 950000, stock: 15 },
    { shopIdx: 5, name: 'Hạc Đồng Cưỡi Quy', cat: 'Đồ thờ', price: 3200000, stock: 5 },
    // Đá (Shop 6)
    { shopIdx: 6, name: 'Tượng Phật Quan Âm Đá Non Nước', cat: 'Tượng đá', price: 2100000, stock: 5 },
    { shopIdx: 6, name: 'Cối Đá Mini Trang Trí', cat: 'Trang trí', price: 300000, stock: 30 },
    // Thêu (Shop 7)
    { shopIdx: 7, name: 'Tranh Thêu Tay Hoa Mẫu Đơn', cat: 'Tranh nghệ thuật', price: 4200000, stock: 4 },
    { shopIdx: 7, name: 'Khăn Tay Thêu Tên', cat: 'Phụ kiện', price: 150000, stock: 100 },
    // Đông Hồ (Shop 8)
    { shopIdx: 8, name: 'Bộ Tranh Đám Cưới Chuột', cat: 'Tranh dân gian', price: 200000, stock: 50 },
    // Cói (Shop 9)
    { shopIdx: 9, name: 'Túi Xách Cói Thời Trang', cat: 'Phụ kiện', price: 280000, stock: 60 },
  ];

  let prodCount = 0;
  const createdProducts = []; // Lưu lại để dùng cho tạo Order
  
  for (const p of productsData) {
    const randomSold = getSeededRandomInt(10, 500);
    const randomView = getSeededRandomInt(randomSold + 50, 3000); 

    const product = await prisma.product.create({
      data: {
        shopId: createdShops[p.shopIdx].id,
        name: p.name,
        description: `Sản phẩm thủ công cao cấp từ ${createdShops[p.shopIdx].villageName}.`,
        price: p.price,
        stockQuantity: p.stock,
        category: p.cat,
        material: 'Tự nhiên',
        origin: createdShops[p.shopIdx].villageName,
        images: [`https://placehold.co/600x600?text=${encodeURIComponent(p.name)}`],
        soldCount: randomSold,
        viewCount: randomView,
      },
    });
    createdProducts.push(product);
    prodCount++;
  }

  console.log(`📦 Đã tạo xong ${prodCount} Products.`);

  // --- TẠO ORDERS (2 Đơn cho mỗi Buyer) ---
  console.log('🛒 Đang tạo Order (Đơn hàng)...');
  
  const orderStatuses = ['PENDING', 'SHIPPING', 'COMPLETED', 'CANCELLED'];

  for (const buyer of buyers) {
    // Mỗi người mua 2 đơn
    for (let i = 0; i < 2; i++) {
      // Mỗi đơn mua ngẫu nhiên 1-3 loại sản phẩm
      const itemsCount = getSeededRandomInt(1, 3);
      const orderItemsData = [];
      let totalAmount = 0;

      for (let j = 0; j < itemsCount; j++) {
        // Chọn sản phẩm ngẫu nhiên
        const randomProdIndex = getSeededRandomInt(0, createdProducts.length - 1);
        const product = createdProducts[randomProdIndex];
        const quantity = getSeededRandomInt(1, 3);
        const price = Number(product.price); // Convert Decimal to Number

        totalAmount += price * quantity;
        
        orderItemsData.push({
          productId: product.id,
          quantity: quantity,
          price: price
        });
      }

      // Random status, nhưng ưu tiên COMPLETED để hiện lịch sử mua hàng
      const statusIndex = getSeededRandomInt(0, 3); 
      const randomStatus = i === 0 ? 'COMPLETED' : orderStatuses[statusIndex]; // Đơn đầu tiên luôn Completed

      await prisma.order.create({
        data: {
          userId: buyer.id,
          totalAmount: totalAmount,
          address: '123 Đường Láng, Hà Nội',
          phone: '0987654321',
          status: randomStatus, 
          orderItems: {
            create: orderItemsData
          }
        }
      });
    }
  }
  console.log(`✅ Đã tạo xong Orders.`);

  // TẠO BLOGS
  const blogsGom = [
    { title: 'Lịch sử 500 năm làng gốm Bát Tràng', date: '2024-11-15T08:00:00Z', read: '8 phút đọc' },
    { title: 'Quy trình làm gốm truyền thống', date: '2024-11-12T09:00:00Z', read: '10 phút đọc' },
    { title: 'Lò nung gốm - Trái tim của làng nghề', date: '2024-11-08T10:30:00Z', read: '6 phút đọc' },
    { title: 'Nghệ nhân nổi tiếng của Bát Tràng', date: '2024-11-05T14:00:00Z', read: '7 phút đọc' },
    { title: 'Nghệ thuật vẽ hoa văn trên gốm', date: '2024-11-01T15:45:00Z', read: '9 phút đọc' },
    { title: 'Trải nghiệm làm gốm tại Bát Tràng', date: '2024-10-28T08:15:00Z', read: '5 phút đọc' },
  ];

  const blogsMoi = [
    { title: 'Cách bảo quản đồ gỗ mỹ nghệ bền đẹp', date: '2024-11-20T08:00:00Z', read: '5 phút đọc', shopIdx: 3, tags: ['Mẹo vặt', 'Đồ gỗ'] },
    { title: 'Phân biệt lụa tơ tằm thật và giả', date: '2024-11-18T09:30:00Z', read: '7 phút đọc', shopIdx: 1, tags: ['Kiến thức', 'Lụa'] },
    { title: 'Ý nghĩa tranh Đông Hồ ngày Tết', date: '2024-11-25T10:00:00Z', read: '6 phút đọc', shopIdx: 8, tags: ['Văn hóa', 'Tranh'] },
    { title: 'Quy trình làm tranh sơn mài công phu', date: '2024-11-22T14:15:00Z', read: '12 phút đọc', shopIdx: 4, tags: ['Nghệ thuật', 'Sơn mài'] },
  ];

  for (const b of blogsGom) {
    await prisma.blog.create({
      data: {
        shopId: createdShops[0].id,
        title: b.title,
        slug: slugify(b.title),
        description: 'Bài viết chi tiết về làng nghề...',
        content: '# Nội dung bài viết \n\n Đây là nội dung chi tiết...',
        coverUrl: 'https://placehold.co/600x400?text=Blog+Gom',
        tags: ['Gốm sứ', 'Văn hóa'],
        isPublished: true,
        createdAt: new Date(b.date),
        readingTime: b.read,
      },
    });
  }

  for (const b of blogsMoi) {
    await prisma.blog.create({
      data: {
        shopId: createdShops[b.shopIdx].id,
        title: b.title,
        slug: slugify(b.title),
        description: `Tìm hiểu về ${b.title}...`,
        content: '# Nội dung bài viết \n\n Kiến thức bổ ích...',
        coverUrl: `https://placehold.co/600x400?text=${encodeURIComponent(b.title)}`,
        tags: b.tags,
        isPublished: true,
        createdAt: new Date(b.date),
        readingTime: b.read,
      },
    });
  }

  console.log(`✅ Đã tạo xong Blogs.`);
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