# 🚀 快速开始指南

## 方法一：使用启动脚本（推荐）

```bash
# 1. 进入项目目录
cd /Users/icsoc/ZTTH/collect-code

# 2. 给启动脚本添加执行权限
chmod +x start.sh

# 3. 运行启动脚本
./start.sh
```

启动脚本会自动：
- 检查依赖是否安装
- 启动后端服务（端口 5280）
- 启动前端服务（端口 5380）

## 方法二：手动启动

### 第一步：安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 第二步：启动服务

**终端1 - 启动后端：**
```bash
cd backend
npm start
```

**终端2 - 启动前端：**
```bash
cd frontend
npm run dev
```

### 第三步：访问应用

在浏览器中打开：`http://localhost:5380`

## 方法三：使用 Python 脚本（命令行模式）

```bash
# 给 Python 脚本添加执行权限
chmod +x scripts/git_stats.py

# 运行脚本
python3 scripts/git_stats.py /path/to/your/projects

# 或者保存结果到文件
python3 scripts/git_stats.py /path/to/your/projects output.json
```

## 📝 使用示例

### Web 界面

1. 打开 `http://localhost:5380`
2. 选择文件夹（三种方式任选其一）：
   - 💡 **推荐**：直接输入完整路径，例如：`/Users/username/projects`
   - 📁 点击"选择"按钮，选择文件夹后输入完整路径
   - 🖱️ 拖放文件夹到拖放区域，然后输入完整路径
3. 点击"开始分析"
4. 查看统计结果

> **提示**：由于浏览器安全限制，无法直接获取文件系统完整路径，选择文件夹后需要手动输入完整路径

### Python 命令行

```bash
# 示例1：分析单个项目文件夹
python3 scripts/git_stats.py ~/my-projects

# 示例2：分析并保存结果
python3 scripts/git_stats.py ~/my-projects result.json

# 示例3：分析当前目录的父目录
python3 scripts/git_stats.py ..
```

## 🎯 预期结果

分析完成后，你将看到：

1. **总体统计卡片**
   - 仓库总数
   - 提交者总数
   - 总添加/删除行数
   - 总改动量和提交次数

2. **每个仓库的详细表格**
   - 提交者排名（带奖牌 🥇🥈🥉）
   - 每个人的代码添加量
   - 每个人的代码删除量
   - 总改动量（自动排序）
   - 提交次数

## ⚠️ 常见问题

### 端口被占用

如果提示端口被占用，可以修改配置：

**前端端口（vite.config.js）：**
```javascript
server: {
  port: 5380  // 改成其他端口，如 5381
}
```

**后端端口（server.js）：**
```javascript
const PORT = 5280;  // 改成其他端口，如 5281
```

### Git 命令不可用

确保系统已安装 Git：
```bash
git --version
```

如未安装，请访问：https://git-scm.com/downloads

### 权限问题

如果遇到"无法访问目录"错误：
```bash
# 检查目录权限
ls -la /path/to/directory

# 确保你有读取权限
```

### 分析时间过长

大型仓库可能需要较长时间，这是正常的。可以：
- 先用小型测试文件夹验证
- 确保网络稳定（如果仓库有远程引用）
- 耐心等待，查看终端输出的进度

## 💡 小贴士

1. **测试用例**：先用一个包含 1-2 个小型仓库的文件夹测试
2. **路径格式**：使用绝对路径，避免路径错误
3. **中文支持**：完全支持中文提交者名称
4. **多人协作**：适合团队代码量统计和贡献度分析
5. **定期统计**：可以定期运行，追踪代码量变化

## 🔧 开发模式

如果你想修改代码：

```bash
# 前端开发（自动热重载）
cd frontend
npm run dev

# 后端开发（使用 nodemon 自动重启）
cd backend
npm run dev  # 需要先安装 nodemon
```

---

有问题？查看完整文档：[README.md](./README.md)

