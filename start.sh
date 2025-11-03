#!/bin/bash

# 代码统计工具 - 启动脚本

echo "📊 代码统计工具 - 启动中..."
echo "================================"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查是否已安装依赖
if [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo "📦 检测到未安装依赖，开始安装..."
    echo ""
    
    echo "安装前端依赖..."
    cd frontend && npm install
    
    echo ""
    echo "安装后端依赖..."
    cd ../backend && npm install
    
    cd ..
    echo ""
    echo "✅ 依赖安装完成！"
    echo ""
fi

# 启动后端服务
echo "🚀 启动后端服务..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端服务
echo "🚀 启动前端服务..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "================================"
echo "✅ 服务启动成功！"
echo ""
echo "📝 访问地址："
echo "   前端: http://localhost:5380"
echo "   后端: http://localhost:5280"
echo ""
echo "💡 提示："
echo "   - 在浏览器中打开 http://localhost:5380"
echo "   - 输入要分析的文件夹路径"
echo "   - 点击'开始分析'按钮"
echo ""
echo "⏹️  按 Ctrl+C 停止服务"
echo "================================"

# 等待进程
wait

