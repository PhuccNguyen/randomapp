# 🎰 TingRandom - Vòng Quay May Mắn

Hệ sinh thái của **TINGNECT** phát triển bởi **TRUSTLABS**

Domain: **random.tingnect.com**

## 🌟 Tính năng

- ✅ Vòng quay may mắn real-time với Socket.IO
- ✅ Control panel điều khiển từ xa
- ✅ Kịch bản tự động cho game show
- ✅ Guest display đẹp mắt cho màn hình lớn
- ✅ Lịch sử quay số
- ✅ Authentication với NextAuth
- ✅ MongoDB database
- ✅ Docker ready cho deploy

## 🚀 Quick Start với Docker

### Chạy Local:
```powershell
# Windows
.\docker-start.ps1

# Linux/Mac
./docker-start.sh
```

Xem chi tiết: [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md)

### Deploy lên VPS:
Xem hướng dẫn đầy đủ: [DOCKER_SETUP.md](DOCKER_SETUP.md)

## 📚 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Node.js, Socket.IO
- **Database**: MongoDB
- **Auth**: NextAuth.js
- **Deployment**: Docker, Docker Compose, Nginx
- **Domain**: random.tingnect.com

## 🏗️ Cấu trúc Project

```
tingrandom/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── control/           # Control panel
│   ├── display/guest/     # Guest display
│   └── ...
├── components/            # React components
│   ├── Wheel/            # Vòng quay component
│   ├── ControlPanel/     # Control panel components
│   └── ...
├── lib/                   # Utilities
├── public/               # Static files
├── server.mjs            # Socket.IO server
├── Dockerfile            # Docker config
├── docker-compose.yml    # Docker Compose
├── nginx.conf            # Nginx config
└── ...
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run dev server (without Docker)
npm run dev

# Build
npm run build

# Start production
npm start
```

## 🐳 Docker Commands

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Reset database
docker-compose down -v
```

## 🌐 Environment Variables

Copy `.env.example` thành `.env` và điền:

```env
MONGODB_URI=mongodb://admin:password@mongodb:27017/tingrandom?authSource=admin
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DOMAIN=random.tingnect.com
```

## 📖 Documentation

- [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md) - Quick start guide
- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Chi tiết setup & deploy
- [CHECKLIST.md](CHECKLIST.md) - Feature checklist
- [SEO_START_HERE.md](SEO_START_HERE.md) - SEO guide

## 🔒 Security

- ✅ NextAuth authentication
- ✅ MongoDB authentication
- ✅ HTTPS ready (nginx + Let's Encrypt)
- ✅ Environment variables
- ✅ Docker isolation

## 📊 Health Check

```bash
curl http://localhost:3000/api/health
```

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

Private project by TINGNECT & TRUSTLABS

## 👥 Team

- **TINGNECT** - Ecosystem
- **TRUSTLABS** - Development

## 📞 Support

- Email: support@tingnect.com
- Domain: random.tingnect.com
- GitHub: PhuccNguyen/randomapp
