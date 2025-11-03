# 📊 代码统计工具

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/python-%3E%3D3.6-blue.svg)](https://www.python.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

一个自动化统计 Git 仓库代码量的全栈工具，支持批量分析多个仓库，统计每个提交者的代码贡献。

> **注意**：发布到 GitHub 前，请将上方的仓库链接替换为你的实际仓库地址。

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

## 🚀 启动项目

### 方式一：分别启动前后端

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

### 方式二：使用 Python 脚本（命令行）

```bash
cd scripts
python3 git_stats.py /path/to/your/projects output.json
```

参数说明：
- 第一个参数：要分析的文件夹路径
- 第二个参数（可选）：输出 JSON 文件路径

## 📖 使用说明

### Web 界面使用

1. 在浏览器中打开 `http://localhost:5380`
2. 选择要分析的文件夹（三种方式）：
   - **方式一**：点击"📁 选择"按钮，通过文件选择器选择文件夹
   - **方式二**：拖放文件夹到拖放区域
   - **方式三**：直接在输入框中输入完整路径（例如：`/Users/username/projects`）
   
   ⚠️ **注意**：由于浏览器安全限制，方式一和二选择文件夹后，需要手动在输入框中输入该文件夹的完整路径
3. 选择统计分支：
   - 🌳 **所有分支**（默认）- 统计全部分支的代码
   - 或选择特定分支（master、main、develop 等）
   - 或输入自定义分支名
4. 点击"开始分析"按钮
5. 等待分析完成，查看统计结果

### Python 脚本使用

```bash
# 分析指定文件夹
python3 scripts/git_stats.py ~/projects

# 分析并保存结果到文件
python3 scripts/git_stats.py ~/projects result.json
```

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

## 🔗 相关资源

- [Git 官方文档](https://git-scm.com/doc)
- [React 官方文档](https://react.dev/)
- [Node.js 官方文档](https://nodejs.org/)
- [Vite 官方文档](https://vitejs.dev/)

---

**快速开始示例：**

```bash
# 1. 安装依赖
cd frontend && npm install
cd ../backend && npm install

# 2. 启动后端
cd backend && npm start &

# 3. 启动前端
cd ../frontend && npm run dev

# 4. 打开浏览器访问 http://localhost:5380
```

祝使用愉快！🎉

