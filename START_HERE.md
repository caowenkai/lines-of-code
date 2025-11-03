# 🎯 从这里开始！

欢迎使用代码统计工具！根据你的需求，选择对应的文档：

## 🚀 我想立即使用

→ **阅读：[QUICKSTART.md](QUICKSTART.md)**（5分钟）

**快速步骤：**
```bash
# 1. 安装依赖
cd frontend && npm install
cd ../backend && npm install

# 2. 启动服务
cd .. && ./start.sh

# 3. 打开浏览器
# http://localhost:5380
```

---

## 📦 我想打包部署

→ **阅读：[README.md - 打包构建](README.md#📦-打包构建)**

**快速步骤：**
```bash
# 构建前端
cd frontend && npm run build

# 启动后端（使用 PM2）
cd ../backend
pm2 start server.js --name "collect-code"
```

详细教程：[DEPLOY.md](DEPLOY.md)

---

## 🌐 我想发布到 GitHub

→ **阅读：[PUBLISH_CHECKLIST.md](PUBLISH_CHECKLIST.md)**

**快速步骤：**
```bash
# 1. 初始化 Git
git init
git add .
git commit -m "feat: 代码统计工具 v1.0.0"
git branch -M main

# 2. 在 GitHub 创建仓库
# https://github.com/new

# 3. 推送代码
git remote add origin https://github.com/YOUR_USERNAME/collect-code.git
git push -u origin main
```

---

## 🤝 我想参与开发

→ **阅读：[CONTRIBUTING.md](CONTRIBUTING.md)**

**快速步骤：**
```bash
# 1. Fork 仓库
# 2. 克隆到本地
git clone https://github.com/YOUR_USERNAME/collect-code.git

# 3. 创建分支
git checkout -b feature/your-feature

# 4. 提交 PR
```

---

## 📚 所有文档列表

### 🎯 必读文档（按顺序）

| # | 文档 | 说明 | 适合 |
|---|------|------|------|
| 1 | [README.md](README.md) | 项目介绍、功能特性、快速开始 | 所有人 ⭐ |
| 2 | [QUICKSTART.md](QUICKSTART.md) | 5分钟快速上手 | 新手 ⭐ |

### 📖 进阶文档（按需阅读）

| 文档 | 说明 | 何时阅读 |
|------|------|----------|
| [BRANCH_FEATURE.md](BRANCH_FEATURE.md) | 分支统计功能详解 | 需要按分支统计时 |
| [DEPLOY.md](DEPLOY.md) | 详细部署指南 | 部署到生产环境时 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 贡献指南 | 想参与开发时 |
| [PUBLISH_CHECKLIST.md](PUBLISH_CHECKLIST.md) | GitHub 发布清单 | 发布到 GitHub 时 |
| [DOCS_INDEX.md](DOCS_INDEX.md) | 完整文档索引 | 查找特定文档时 |

### 📄 配置文件

| 文件 | 说明 |
|------|------|
| [LICENSE](LICENSE) | MIT 开源协议 |
| `.github/workflows/ci.yml` | CI/CD 自动化 |
| `.github/ISSUE_TEMPLATE/` | Issue 模板 |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR 模板 |

---

## 🎓 学习路径

### 路径 1：快速使用者
```
START_HERE.md → QUICKSTART.md → 开始使用
```
耗时：**10 分钟**

### 路径 2：部署运维
```
START_HERE.md → README.md（打包部分）→ DEPLOY.md
```
耗时：**30 分钟**

### 路径 3：开源贡献者
```
START_HERE.md → CONTRIBUTING.md → 开始开发
```
耗时：**20 分钟**

---

## ❓ 常见问题速查

| 问题 | 解决方案 | 详见 |
|------|----------|------|
| 如何启动？ | `./start.sh` | [QUICKSTART.md](QUICKSTART.md) |
| 如何打包？ | `npm run build` | [README.md](README.md#📦-打包构建) |
| 如何部署？ | PM2 + Nginx | [DEPLOY.md](DEPLOY.md) |
| 如何发布？ | 按清单检查 | [PUBLISH_CHECKLIST.md](PUBLISH_CHECKLIST.md) |
| 端口被占用？ | 修改配置文件 | [QUICKSTART.md](QUICKSTART.md#q1-端口被占用怎么办) |

---

## 🆘 获取帮助

- 📖 **查看文档**：先看 [QUICKSTART.md](QUICKSTART.md)
- 🐛 **报告问题**：[提交 Issue](../../issues)
- 💬 **功能建议**：[Discussions](../../discussions)

---

**找到你需要的了吗？现在就开始吧！** 🚀

> 💡 **推荐**：新手直接阅读 [QUICKSTART.md](QUICKSTART.md)，5分钟即可上手！

