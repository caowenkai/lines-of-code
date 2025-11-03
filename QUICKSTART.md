# 🚀 5分钟快速上手

> 按照下面的步骤，5 分钟内即可启动并使用代码统计工具！

## 📋 开始前准备

确保已安装：

```bash
# 检查 Node.js（需要 >= 16.0.0）
node --version

# 检查 Python（需要 >= 3.6）
python3 --version

# 检查 Git
git --version
```

---

## 🎯 三步启动

### **Step 1**: 安装依赖

```bash
# 进入项目目录
cd collect-code

# 安装前端依赖
cd frontend && npm install

# 安装后端依赖
cd ../backend && npm install

# 返回项目根目录
cd ..
```

### **Step 2**: 启动服务

```bash
# 给启动脚本添加执行权限
chmod +x start.sh

# 一键启动
./start.sh
```

看到如下提示即启动成功：
```
✅ 后端服务启动成功！运行在: http://localhost:5280
✅ 前端服务启动成功！运行在: http://localhost:5380
🎉 打开浏览器访问: http://localhost:5380
```

### **Step 3**: 获取并粘贴文件夹路径

**macOS 用户：**
1. 在访达中右键点击文件夹
2. 按住 `Option` 键
3. 选择"拷贝...作为路径名称"
4. 粘贴到输入框

**Windows 用户：**
1. 在文件资源管理器中点击地址栏
2. 复制完整路径
3. 粘贴到输入框

### **Step 4**: 开始分析

1. 浏览器打开 **http://localhost:5380**
2. 粘贴文件夹完整路径（例如：`/Users/username/projects`）
3. 选择分支（默认"所有分支"）
4. 点击 **"开始分析"** 按钮
5. 等待分析完成，查看结果

---

## 📖 使用说明

### 方式一：Web 界面（推荐）

**适合**：喜欢可视化界面，需要查看详细表格

**操作步骤**：
1. 访问 http://localhost:5380
2. 按照页面提示获取文件夹路径并粘贴
   - macOS: 右键 → 按住 Option → "拷贝...作为路径名称"
   - Windows: 点击地址栏 → 复制路径
3. 选择分支：
   - 🌳 所有分支（默认）
   - 或选择：master、main、develop 等
   - 或自定义分支名
4. 点击"开始分析"
5. 查看统计表格

**提示**：
- 💡 路径示例：`/Users/username/projects`（macOS）或 `C:\Users\username\projects`（Windows）
- ⚠️ 由于浏览器安全限制，Web 应用无法直接访问文件系统路径，需要手动粘贴

### 方式二：Python 命令行

**适合**：喜欢命令行，需要批处理

```bash
# 基本用法
python3 scripts/git_stats.py /path/to/your/projects

# 保存结果到 JSON 文件
python3 scripts/git_stats.py /path/to/your/projects output.json
```

**示例**：
```bash
# 分析当前用户的项目文件夹
python3 scripts/git_stats.py ~/projects

# 分析并保存结果
python3 scripts/git_stats.py ~/projects result.json
```

---

## 🎯 预期结果

分析完成后，你将看到：

### 1. 总体统计卡片
- 📊 仓库总数
- 👥 提交者总数  
- ➕ 总添加行数
- ➖ 总删除行数
- 📈 总改动量
- 🔢 总提交次数

### 2. 每个仓库的详细表格
| 提交者 | 添加 | 删除 | 总改动 | 提交次数 |
|--------|------|------|--------|----------|
| 🥇 张三 | 5000 | 2000 | 7000 | 150 |
| 🥈 李四 | 3000 | 1500 | 4500 | 80 |
| 🥉 王五 | 2000 | 1000 | 3000 | 60 |

---

## ⚠️ 常见问题

### Q1: 端口被占用怎么办？

**修改前端端口**（`frontend/vite.config.js`）：
```javascript
server: {
  port: 5381  // 改成其他端口
}
```

**修改后端端口**（`backend/server.js`）：
```javascript
const PORT = 5281;  // 改成其他端口
```

记得同时修改 `vite.config.js` 中的代理配置！

### Q2: 提示 Git 命令不可用？

```bash
# 检查是否安装 Git
git --version

# 未安装？访问安装：
# https://git-scm.com/downloads
```

### Q3: 分析时间很长？

- ✅ 正常现象（大型仓库需要时间）
- 💡 建议先用小文件夹测试
- 📊 查看终端输出，确认正在运行

### Q4: 无法访问目录？

```bash
# 检查目录权限
ls -la /path/to/directory

# 确保你有读取权限
```

### Q5: 如何快速获取文件夹路径？

**macOS**: 右键文件夹 → 按住 `Option` 键 → "拷贝...作为路径名称"  
**Windows**: 文件资源管理器地址栏 → 点击并复制

详细说明见 [README.md - 使用说明](README.md#📖-使用说明)

---

## 💡 使用技巧

1. **先测试小文件夹**  
   包含 1-2 个小型仓库的文件夹，验证功能

2. **使用绝对路径**  
   避免相对路径可能的错误

3. **定期统计**  
   每周/每月运行一次，追踪代码量变化

4. **团队协作**  
   统计团队成员贡献度

5. **多分支对比**  
   分别统计不同分支，对比代码量

---

## 📚 更多信息

- 📖 [完整文档](README.md)
- 🌳 [分支统计功能](BRANCH_FEATURE.md)
- 🚀 [部署指南](DEPLOY.md)
- 🤝 [贡献指南](CONTRIBUTING.md)

---

**准备好了吗？开始分析你的代码吧！** 🎉
