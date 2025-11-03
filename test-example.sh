#!/bin/bash

# 测试脚本示例
# 用于测试 Python 脚本功能

echo "🧪 代码统计工具 - 测试示例"
echo "================================"
echo ""

# 测试当前项目目录
echo "📂 测试场景1: 分析当前项目"
echo "命令: python3 scripts/git_stats.py ."
echo ""
python3 scripts/git_stats.py . test-output.json

echo ""
echo "================================"
echo "✅ 测试完成！"
echo ""
echo "查看结果："
echo "  - 终端输出（上方）"
echo "  - JSON 文件: test-output.json"
echo ""

