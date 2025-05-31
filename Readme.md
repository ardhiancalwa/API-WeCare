# API-WECARE

API service for WeCare healthcare platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone repository
```bash
git clone https://github.com/yourusername/API-WECARE.git
cd API-WECARE
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
Buat file `.env` di root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/wecare_db"

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
```

4. Setup database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

5. Run the application
```bash
# Development
npm run dev

# Production
npm start
```

## 📚 Available Scripts

- `npm start` - Run in production mode
- `npm run dev` - Run in development mode with hot reload
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🍏 WeCare Team

- Muhammad Fathir Ramdhennis (Project Manager)
- Christian Bryan Seputra (UI/UX Designer)
- Yohan Artha Pratama (Front-End Developer) 
- Ardhian Calwa Nugraha (Back-End Developer)