# 🚀 部署指南

本文档提供了在不同环境下部署代码统计工具的方法。

## 📦 本地开发部署

### 前置要求

- Node.js >= 16.0.0
- Python >= 3.6
- Git 已安装

### 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/your-username/collect-code.git
cd collect-code

# 2. 安装依赖
cd frontend && npm install
cd ../backend && npm install

# 3. 启动服务
cd ..
./start.sh
```

访问：http://localhost:5380

## 🐳 Docker 部署（推荐）

### 创建 Dockerfile

**frontend/Dockerfile**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**backend/Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 5280
CMD ["node", "server.js"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5280:5280"
    volumes:
      - /path/to/your/repos:/repos:ro
    environment:
      - NODE_ENV=production

  frontend:
    build: ./frontend
    ports:
      - "5380:80"
    depends_on:
      - backend
```

### 启动

```bash
docker-compose up -d
```

## ☁️ 云平台部署

### Vercel（前端）

1. 导入 GitHub 仓库到 Vercel
2. 设置构建配置：
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Heroku（后端）

```bash
# 1. 创建 Heroku 应用
heroku create your-app-name

# 2. 设置 buildpack
heroku buildpacks:set heroku/nodejs

# 3. 配置环境变量
heroku config:set NODE_ENV=production

# 4. 部署
git subtree push --prefix backend heroku main
```

### Railway（全栈）

1. 连接 GitHub 仓库
2. 添加两个服务：
   - Frontend: 根目录设为 `frontend`
   - Backend: 根目录设为 `backend`

## 🖥️ VPS 部署

### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        root /var/www/collect-code/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:5280;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 进程管理

```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd backend
pm2 start server.js --name "collect-code-backend"

# 保存配置
pm2 save
pm2 startup
```

## 🔒 生产环境配置

### 环境变量

**backend/.env.production**
```bash
NODE_ENV=production
PORT=5280
MAX_BUFFER=10485760
TIMEOUT=30000
```

**frontend/.env.production**
```bash
VITE_API_URL=https://your-api-domain.com
```

### 安全建议

1. **使用 HTTPS**
   ```bash
   # 使用 Let's Encrypt
   certbot --nginx -d your-domain.com
   ```

2. **限流**
   ```javascript
   // backend/server.js
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   app.use('/api/', limiter);
   ```

3. **CORS 配置**
   ```javascript
   app.use(cors({
     origin: 'https://your-frontend-domain.com'
   }));
   ```

## 📊 监控和日志

### 日志配置

```javascript
// backend/server.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 性能监控

建议使用：
- New Relic
- Datadog
- PM2 Plus

## 🔄 更新部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 更新依赖
cd frontend && npm install
cd ../backend && npm install

# 3. 构建前端
cd frontend && npm run build

# 4. 重启服务
pm2 restart collect-code-backend
```

## 🐛 故障排除

### 端口被占用

```bash
# 查看端口占用
lsof -i :5280
lsof -i :5380

# 终止进程
kill -9 <PID>
```

### 权限问题

```bash
# 给予执行权限
chmod +x start.sh

# 修改文件所有者
chown -R $USER:$USER /path/to/collect-code
```

## 📝 部署检查清单

- [ ] 环境变量配置完成
- [ ] 数据库连接正常（如果有）
- [ ] 静态资源正确加载
- [ ] API 请求正常
- [ ] 日志系统运行
- [ ] 监控配置完成
- [ ] 备份策略设置
- [ ] HTTPS 证书配置
- [ ] 防火墙规则设置
- [ ] 域名解析正确

## 🆘 获取帮助

遇到部署问题？
- 查看 [Issues](https://github.com/your-username/collect-code/issues)
- 阅读 [FAQ](README.md#faq)
- 创建新的 Issue

---

**祝部署顺利！** 🎉

