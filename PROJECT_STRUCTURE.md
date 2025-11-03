# 📁 项目结构说明

## 目录结构

```
collect-code/
├── frontend/                  # 前端项目（Vite + React）
│   ├── src/
│   │   ├── App.jsx           # 主应用组件
│   │   ├── App.css           # 应用样式
│   │   ├── main.jsx          # 入口文件
│   │   └── index.css         # 全局样式
│   ├── index.html            # HTML 模板
│   ├── vite.config.js        # Vite 配置
│   └── package.json          # 前端依赖
│
├── backend/                   # 后端项目（Node.js + Express）
│   ├── server.js             # Express 服务器
│   └── package.json          # 后端依赖
│
├── scripts/                   # Python 脚本
│   └── git_stats.py          # Git 统计脚本（命令行版本）
│
├── start.sh                   # 一键启动脚本
├── test-example.sh           # 测试示例脚本
├── package.json              # 根项目配置
├── .gitignore                # Git 忽略配置
├── README.md                 # 完整文档
├── QUICKSTART.md             # 快速开始指南
└── PROJECT_STRUCTURE.md      # 项目结构说明（本文件）
```

## 核心文件说明

### 前端部分

#### `frontend/src/App.jsx`
主应用组件，包含：
- 文件夹路径输入
- 分析按钮和加载状态
- 总体统计卡片
- 仓库列表和贡献者表格
- 错误处理和提示

**主要功能：**
- `handleAnalyze()`: 调用后端 API 进行分析
- 数据展示和格式化
- 响应式布局

#### `frontend/src/App.css`
应用样式，包含：
- 渐变色主题
- 卡片式设计
- 表格样式
- 响应式媒体查询
- 动画效果

#### `frontend/vite.config.js`
Vite 配置：
- React 插件
- 开发服务器配置（端口 5380）
- API 代理配置（转发到后端 5280 端口）

### 后端部分

#### `backend/server.js`
Express 服务器，包含：

**核心函数：**

1. `findGitRepositories(rootPath)`
   - 递归查找所有 .git 目录
   - 跳过 node_modules 等依赖目录
   - 返回仓库路径数组

2. `getRepositoryAuthors(repoPath)`
   - 使用 `git log --all --format="%aN"` 获取所有作者
   - 去重并返回作者列表

3. `getAuthorStats(repoPath, author)`
   - 执行 Git 命令统计代码量
   - 返回添加、删除、总改动和提交次数

4. `analyzeRepository(repoPath)`
   - 分析单个仓库
   - 聚合所有作者的统计数据
   - 按总改动量排序

**API 路由：**

- `POST /api/analyze`: 主分析接口
- `GET /api/health`: 健康检查

### Python 脚本

#### `scripts/git_stats.py`
命令行版本的代码统计工具：

**主要函数：**

- `run_command()`: 执行 shell 命令
- `find_git_repositories()`: 查找 Git 仓库
- `get_repository_authors()`: 获取提交者
- `get_author_stats()`: 统计个人数据
- `analyze_repository()`: 分析仓库
- `analyze_folder()`: 主分析函数
- `main()`: CLI 入口点

**使用方式：**
```bash
python3 scripts/git_stats.py <folder_path> [output_file]
```

### 辅助脚本

#### `start.sh`
一键启动脚本：
- 检查 Node.js 环境
- 自动安装依赖（如未安装）
- 同时启动前后端服务
- 显示访问地址

#### `test-example.sh`
测试脚本：
- 演示 Python 脚本的使用
- 分析当前项目目录
- 输出到 JSON 文件

## 数据流程

```
用户输入文件夹路径
    ↓
前端发送 POST 请求到 /api/analyze
    ↓
后端接收请求
    ↓
findGitRepositories() 查找所有仓库
    ↓
对每个仓库：
    ↓
    getRepositoryAuthors() 获取所有作者
    ↓
    对每个作者：
        ↓
        getAuthorStats() 统计代码量
        ↓
        返回 { author, added, deleted, totalChanges, commits }
    ↓
    按 totalChanges 排序
    ↓
    返回仓库统计
    ↓
聚合所有仓库数据
    ↓
计算总体统计
    ↓
返回 JSON 响应给前端
    ↓
前端渲染表格和图表
```

## Git 命令详解

### 获取所有提交者
```bash
git log --all --format="%aN" | sort -u
```
- `--all`: 查看所有分支
- `--format="%aN"`: 只显示作者名
- `sort -u`: 排序并去重

### 统计代码量
```bash
git log --all --author="作者名" --pretty=tformat: --numstat | \
awk '{ add += $1; subs += $2; loc += $1 - $2 } END { print add "," subs "," loc }'
```
- `--author`: 过滤特定作者
- `--numstat`: 显示每次提交的增删行数
- `awk`: 累加计算总量

### 统计提交次数
```bash
git log --all --author="作者名" --oneline | wc -l
```
- `--oneline`: 每次提交一行
- `wc -l`: 统计行数

## 配置说明

### 前端配置

**端口修改：** `frontend/vite.config.js`
```javascript
server: {
  port: 5380  // 改为其他端口
}
```

**API 地址：** `frontend/vite.config.js`
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5280'  // 后端地址
  }
}
```

### 后端配置

**端口修改：** `backend/server.js`
```javascript
const PORT = 5280;  // 改为其他端口
```

**缓冲区大小：** `backend/server.js`
```javascript
maxBuffer: 1024 * 1024 * 10  // 10MB，处理大型仓库
```

## 扩展开发

### 添加新功能

1. **新的统计指标**
   - 修改 `backend/server.js` 的 `getAuthorStats()` 函数
   - 添加新的 Git 命令
   - 更新前端 `App.jsx` 的表格列

2. **新的数据可视化**
   - 安装图表库（如 Chart.js）
   - 在 `App.jsx` 中添加图表组件
   - 处理统计数据

3. **数据导出**
   - 添加导出按钮
   - 实现 CSV/Excel 导出功能
   - 或使用 JSON 下载

### 性能优化

1. **并行处理**
   - 使用 `Promise.all()` 并行分析多个仓库
   - 前端显示进度条

2. **缓存机制**
   - 缓存已分析的仓库结果
   - 定期刷新或手动刷新

3. **分页加载**
   - 大量仓库时分页显示
   - 虚拟滚动优化

## 故障排除

### 常见问题

1. **端口占用**
   - 修改配置文件中的端口号
   - 或终止占用端口的进程

2. **Git 命令失败**
   - 确保 Git 已安装
   - 检查仓库路径权限
   - 查看终端错误日志

3. **依赖安装失败**
   - 清除缓存：`npm cache clean --force`
   - 删除 node_modules 重新安装
   - 检查网络连接

4. **分析超时**
   - 增加 `maxBuffer` 大小
   - 增加超时时间
   - 分批处理大型仓库

## 技术栈版本

- **Node.js**: ≥ 16.0.0
- **React**: ^18.2.0
- **Vite**: ^5.0.8
- **Express**: ^4.18.2
- **Python**: ≥ 3.6

## 相关资源

- [Express 文档](https://expressjs.com/)
- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [Git 命令参考](https://git-scm.com/docs)

---

**更新日期**: 2025-11-03

