module.exports = {
  apps: [
    {
      name: 'bat-trang-backend', // Tên hiển thị trong PM2
      script: 'dist/main.js',    // File chạy (sau khi build NestJS)
      instances: 1,              // Số lượng process (để 1 hoặc 'max' để tận dụng đa nhân)
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 6000, // <--- Chạy port 6000 như bạn muốn
        // Quan trọng: Vì chạy trên Host, DB ở localhost port 5433
        DATABASE_URL: "postgresql://admin:password123@localhost:5433/battrang_db?schema=public",
        JWT_SECRET: "DayLaKhoaBiMatCuaDuAnBatTrangCeramics2024"
      },
    },
  ],
};