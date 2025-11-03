# 📋 GitHub 发布检查清单

在发布到 GitHub 之前，请确保完成以下步骤：

## ✅ 基础文件

- [x] **README.md** - 项目说明文档（已完成）
- [x] **LICENSE** - 开源许可证（MIT）
- [x] **.gitignore** - Git 忽略配置
- [x] **CONTRIBUTING.md** - 贡献指南
- [x] **QUICKSTART.md** - 快速开始指南
- [x] **CHANGELOG.md** - 更新日志（UPDATE_LOG.md）

## 🔒 安全检查

- [ ] **移除敏感信息**
  ```bash
  # 检查是否有以下内容：
  grep -r "password" .
  grep -r "secret" .
  grep -r "api_key" .
  grep -r "token" .
  ```

- [ ] **检查 .gitignore**
  - [x] node_modules/
  - [x] .env
  - [x] *.log
  - [x] dist/
  - [x] build/

- [ ] **移除测试数据**
  - [ ] 删除 test-output.json
  - [ ] 删除临时测试文件

## 📦 依赖管理

- [ ] **锁定依赖版本**
  ```bash
  # 前端
  cd frontend && npm install
  
  # 后端
  cd backend && npm install
  
  # 确保生成 package-lock.json
  ```

- [ ] **检查 package.json**
  - [x] 项目名称
  - [x] 版本号
  - [x] 描述
  - [x] 作者
  - [x] 许可证
  - [x] 仓库地址（需更新）

## 📸 视觉资源

- [ ] **添加截图**
  1. 创建 `screenshots/` 目录
  2. 添加主界面截图
  3. 添加统计结果截图
  4. 在 README 中引用

- [ ] **添加演示 GIF**
  - 录制操作流程
  - 使用 Gifox 或 LICEcap
  - 文件大小 < 5MB

## 📝 文档完善

- [ ] **更新 README.md**
  - [ ] 添加徽章（Badges）
  - [ ] 添加在线演示链接（可选）
  - [ ] 添加截图
  - [ ] 检查所有链接

- [ ] **检查文档链接**
  ```bash
  # 确保所有相对链接正确
  # README.md -> QUICKSTART.md
  # README.md -> BRANCH_FEATURE.md
  ```

## 🛠️ 代码质量

- [ ] **移除调试代码**
  ```bash
  grep -r "console.log" frontend/src/
  grep -r "debugger" frontend/src/
  ```

- [ ] **代码格式化**
  ```bash
  # 可选：使用 Prettier
  npx prettier --write "frontend/src/**/*.{js,jsx}"
  ```

## 🧪 测试

- [ ] **本地测试**
  ```bash
  # 启动服务
  ./start.sh
  
  # 测试功能
  # 1. 输入路径分析
  # 2. 分步输入分析
  # 3. 分支选择
  # 4. 查看结果
  ```

- [ ] **清理安装测试**
  ```bash
  # 删除 node_modules
  rm -rf frontend/node_modules backend/node_modules
  
  # 重新安装
  cd frontend && npm install
  cd ../backend && npm install
  
  # 测试启动
  ./start.sh
  ```

## 📦 Git 准备

- [ ] **初始化 Git 仓库**
  ```bash
  git init
  git add .
  git commit -m "Initial commit: 代码统计工具 v1.0.0"
  ```

- [ ] **设置默认分支**
  ```bash
  git branch -M main
  ```

## 🚀 GitHub 操作

### 1. 创建仓库

1. 访问 https://github.com/new
2. 仓库名称：`collect-code` 或其他名称
3. 描述：`自动化统计 Git 仓库代码量的全栈工具`
4. 公开（Public）或私有（Private）
5. **不要**勾选 "Initialize with README"（我们已有）
6. 点击 "Create repository"

### 2. 推送代码

```bash
git remote add origin https://github.com/your-username/collect-code.git
git push -u origin main
```

### 3. 配置仓库

在 GitHub 仓库页面：

- [ ] **About 部分**
  - 添加描述
  - 添加主题标签：`git`, `statistics`, `code-analysis`, `react`, `nodejs`
  - 添加网站（如果有在线演示）

- [ ] **Topics**
  ```
  git, statistics, code-analysis, react, nodejs, 
  vite, express, python, developer-tools
  ```

- [ ] **启用 Discussions**（可选）
  - Settings → Features → Discussions

- [ ] **设置分支保护**（可选）
  - Settings → Branches → Add rule
  - 保护 main 分支

### 4. 添加徽章

在 README.md 顶部添加：

```markdown
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/python-%3E%3D3.6-blue.svg)](https://www.python.org/)
```

## 📢 发布后

- [ ] **创建 Release**
  1. 点击 "Releases"
  2. 点击 "Create a new release"
  3. 标签：`v1.0.0`
  4. 标题：`v1.0.0 - 首次发布`
  5. 描述功能特性
  6. 发布

- [ ] **编写公告**
  - 在社交媒体分享
  - 在技术社区发布

- [ ] **监控反馈**
  - 关注 Issues
  - 回复问题
  - 收集改进建议

## 🎯 推荐的 package.json 更新

### frontend/package.json
```json
{
  "name": "collect-code-frontend",
  "version": "1.0.0",
  "description": "代码统计工具前端",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/collect-code.git"
  },
  "keywords": ["git", "statistics", "code-analysis"],
  "author": "Your Name",
  "license": "MIT"
}
```

### backend/package.json
```json
{
  "name": "collect-code-backend",
  "version": "1.0.0",
  "description": "代码统计工具后端",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/collect-code.git"
  },
  "keywords": ["git", "statistics", "nodejs"],
  "author": "Your Name",
  "license": "MIT"
}
```

## 📋 快速命令

```bash
# 1. 检查状态
git status

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "feat: 完成代码统计工具 v1.0.0"

# 4. 创建 GitHub 仓库后，添加远程仓库
git remote add origin https://github.com/your-username/collect-code.git

# 5. 推送
git push -u origin main

# 6. 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

**准备完成后，你的项目就可以发布到 GitHub 了！** 🎉

记得在 README.md 中更新 GitHub 仓库地址！

