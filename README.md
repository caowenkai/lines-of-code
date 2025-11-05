# 📊 代码统计工具（谁是卷王？）

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/python-%3E%3D3.6-blue.svg)](https://www.python.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

一个自动化统计 Git 仓库代码量的全栈工具，支持批量分析多个仓库，统计每个提交者的代码贡献。

## 📚 文档导航

> 📌 **新手必读**：[START_HERE.md](START_HERE.md) → [QUICKSTART.md](QUICKSTART.md)

| 我想... | 查看文档 | 耗时 |
|---------|----------|------|
| 🎯 了解从哪开始 | [START_HERE.md](START_HERE.md) ⭐ | 1分钟 |
| 🚀 快速开始使用 | [QUICKSTART.md](QUICKSTART.md) ⭐ | 5分钟 |
| 📦 打包和部署 | [DEPLOY.md](DEPLOY.md) | 30分钟 |
| 🌐 发布到 GitHub | [PUBLISH_CHECKLIST.md](PUBLISH_CHECKLIST.md) | 20分钟 |
| 🤝 参与贡献代码 | [CONTRIBUTING.md](CONTRIBUTING.md) | 15分钟 |
| 🌳 学习分支统计 | [BRANCH_FEATURE.md](BRANCH_FEATURE.md) | 5分钟 |
| 📖 查看所有文档 | [文档说明.md](文档说明.md) | - |

---

## ✨ 功能特性

- 🔍 **自动发现仓库**：递归扫描指定文件夹，自动识别所有 Git 仓库
- 👥 **提交者统计**：统计每个提交者的代码添加量、删除量和总改动量
- 📈 **多仓库支持**：同时分析多个仓库，生成独立的统计报表
- 🏆 **排名展示**：根据总改动量自动排名，突出显示前三名
- 💎 **现代化UI**：美观的渐变色设计，响应式布局
- 📂 **多种输入方式**：支持文件选择器、拖放文件夹、手动输入路径
- 🌳 **分支统计**：支持按分支统计（所有分支/特定分支）
- 📊 **总体统计**：汇总所有仓库的统计数据

## 🏗️ 技术栈

### 前端
- **Vite** - 快速的前端构建工具
- **React** - 用户界面库
- **Axios** - HTTP 客户端

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **Python** - Git 命令行工具（可选）

## 📦 安装步骤

### 1. 克隆或下载项目

```bash
cd /Users/icsoc/ZTTH/collect-code
```

### 2. 安装前端依赖

```bash
cd frontend
npm install
```

### 3. 安装后端依赖

```bash
cd ../backend
npm install
```

### 4. Python 环境（可选）

如果要使用 Python 脚本：

```bash
# 确保已安装 Python 3.6+
python3 --version

# Python 脚本使用系统自带的库，无需额外安装
```

## ⚡ 快速开始

### 1️⃣ 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 2️⃣ 启动服务

**方式一：一键启动（推荐）**

```bash
chmod +x start.sh
./start.sh
```

**方式二：分别启动**

#### 启动后端服务（终端1）

```bash
cd backend
npm start
```

后端服务将运行在 `http://localhost:5280`

#### 启动前端开发服务器（终端2）

```bash
cd frontend
npm run dev
```

前端服务将运行在 `http://localhost:5380`

### 3️⃣ 开始使用

1. 打开浏览器访问 `http://localhost:5380`
2. 在左侧输入要分析的文件夹完整路径
3. 选择要统计的分支（默认所有分支）
4. 点击"开始分析"按钮
5. 查看统计结果

> 💡 **提示**：也可以使用 Python 命令行版本，详见 [QUICKSTART.md](QUICKSTART.md#方法三使用-python-脚本命令行模式)

## 📖 使用说明

### 获取文件夹路径

**macOS 用户：**
1. 在访达中找到要分析的文件夹
2. 右键点击文件夹
3. 按住 `Option` 键
4. 选择"拷贝...作为路径名称"
5. 粘贴到输入框

**Windows 用户：**
1. 在文件资源管理器中打开文件夹
2. 点击地址栏
3. 复制完整路径（如 `C:\Users\username\projects`）
4. 粘贴到输入框

> ⚠️ **提示**：由于浏览器安全限制，Web 应用无法直接访问文件系统路径，需要手动粘贴。

## 📦 打包构建

### 前端打包

```bash
cd frontend
npm run build

# 打包产物在 frontend/dist/ 目录
```

### 后端无需打包

后端使用 Node.js 直接运行，无需打包步骤。

## 🚀 部署上线

### 快速部署（使用 PM2）

```bash
# 安装 PM2
npm install -g pm2

# 构建前端
cd frontend && npm run build

# 启动后端
cd ../backend
pm2 start server.js --name "collect-code-api"

# 使用 Nginx 或其他 Web 服务器托管前端静态文件
# 将 frontend/dist/ 目录部署到 Web 服务器
```

### 详细部署教程

查看 [DEPLOY.md](DEPLOY.md) 了解：
- Docker 部署
- Nginx 配置
- 云平台部署（Vercel、Heroku）
- 生产环境配置

## 📊 统计指标说明

每个仓库的统计表格包含以下指标：

- **排名**：根据总改动量排序，前三名显示奖牌 🥇🥈🥉
- **提交者名称**：Git 提交记录中的作者名
- **添加行数**：提交中新增的代码行数
- **删除行数**：提交中删除的代码行数
- **总改动量**：添加行数 + 删除行数
- **提交次数**：该作者的总提交次数

## 🎯 工作原理

1. **仓库发现**：递归扫描文件夹，查找 `.git` 目录
2. **用户识别**：使用 `git log` 获取所有提交者
3. **数据统计**：执行以下 Git 命令获取每个用户的统计数据：
   ```bash
   git log --all --author="用户名" --pretty=tformat: --numstat | \
   awk '{ add += $1; subs += $2; loc += $1 - $2 } END { print add "," subs "," loc }'
   ```
4. **数据汇总**：聚合所有仓库的统计数据
5. **结果展示**：在前端以表格形式展示

## 🔧 API 接口

### POST /api/analyze

分析指定文件夹中的 Git 仓库

**请求体：**
```json
{
  "folderPath": "/path/to/projects"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "repositories": [
      {
        "name": "repo-name",
        "path": "/full/path/to/repo",
        "contributors": [
          {
            "author": "张三",
            "added": 1000,
            "deleted": 200,
            "totalChanges": 1200,
            "commits": 50
          }
        ]
      }
    ],
    "total": {
      "repositoryCount": 5,
      "contributorCount": 10,
      "totalAdded": 50000,
      "totalDeleted": 10000,
      "totalChanges": 60000,
      "totalCommits": 500
    }
  }
}
```

### GET /api/health

健康检查接口

**响应：**
```json
{
  "status": "ok",
  "message": "服务运行正常"
}
```

## 📝 注意事项

1. **权限问题**：确保有权限访问目标文件夹及其子目录
2. **大型仓库**：分析大型仓库可能需要较长时间，请耐心等待
3. **Git 环境**：需要系统已安装 Git 并可在命令行中使用
4. **作者名称**：统计基于 Git 配置的 `user.name`，同一人使用不同名称会被视为不同提交者
5. **跳过目录**：自动跳过 `node_modules`、`venv` 等依赖目录
6. **分支统计**：
   - 默认统计所有分支（`--all`）
   - 可选择特定分支进行统计
   - 不同分支的统计结果可能不同
   - 详见 [分支功能说明](./BRANCH_FEATURE.md)

## 🎨 界面展示

- **渐变色主题**：紫色渐变背景，现代化设计
- **响应式布局**：支持桌面和移动设备
- **数据可视化**：彩色数字标识（绿色=添加，红色=删除，蓝色=总量）
- **排名徽章**：前三名显示金银铜牌
- **卡片式设计**：每个仓库独立展示，清晰明了

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

详细指南请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

## 📞 联系方式

- 提问题：[GitHub Issues](../../issues)
- 讨论区：[GitHub Discussions](../../discussions)

---

**祝使用愉快！** 🎉

如有问题，请先查看 [QUICKSTART.md](QUICKSTART.md) 快速开始指南。

