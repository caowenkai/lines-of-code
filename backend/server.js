import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);

const app = express();
const PORT = 5280;

app.use(cors());
app.use(bodyParser.json());

// 存储所有活跃的SSE连接
const sseClients = new Map();

// 发送日志到所有SSE客户端
function sendLog(sessionId, message, type = 'info') {
  const client = sseClients.get(sessionId);
  if (client) {
    const data = JSON.stringify({ 
      type, 
      message, 
      timestamp: new Date().toISOString() 
    });
    try {
      client.write(`data: ${data}\n\n`);
      // 确保立即刷新数据
      if (client.flush) {
        client.flush();
      }
    } catch (error) {
      console.error(`发送日志失败 [${sessionId}]:`, error.message);
      sseClients.delete(sessionId);
    }
  }
  
  // 同时打印到控制台
  console.log(`[${sessionId}] ${message}`);
}

// SSE endpoint - 用于实时日志推送
app.get('/api/logs/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  console.log(`[SSE] 新的连接请求: ${sessionId}`);
  
  // 设置SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // 禁用nginx缓冲
  res.flushHeaders(); // 立即发送headers
  
  // 保存客户端连接
  sseClients.set(sessionId, res);
  
  // 发送初始连接消息
  sendLog(sessionId, '✅ 已连接到日志服务器', 'success');
  
  // 发送心跳，保持连接
  const heartbeat = setInterval(() => {
    if (sseClients.has(sessionId)) {
      res.write(': heartbeat\n\n');
    } else {
      clearInterval(heartbeat);
    }
  }, 30000); // 每30秒发送一次心跳
  
  // 客户端断开连接时清理
  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(sessionId);
    console.log(`[${sessionId}] 客户端断开连接`);
  });
});

// 查找所有Git仓库
async function findGitRepositories(rootPath, sessionId = null) {
  const repositories = [];
  
  async function searchDirectory(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        // 跳过隐藏文件夹（除了.git）和常见的依赖文件夹
        if (entry.name.startsWith('.') && entry.name !== '.git') continue;
        if (['node_modules', 'vendor', 'venv', '__pycache__'].includes(entry.name)) continue;
        
        if (entry.isDirectory()) {
          // 检查是否是Git仓库
          if (entry.name === '.git') {
            const repoPath = path.dirname(fullPath);
            repositories.push(repoPath);
            if (sessionId) {
              sendLog(sessionId, `📦 发现仓库: ${path.basename(repoPath)}`);
            }
          } else {
            // 递归搜索子目录
            await searchDirectory(fullPath);
          }
        }
      }
    } catch (error) {
      // 忽略无权限访问的目录
      const msg = `⚠️  无法访问目录: ${dirPath}`;
      if (sessionId) {
        sendLog(sessionId, msg, 'warning');
      } else {
        console.log(msg);
      }
    }
  }
  
  await searchDirectory(rootPath);
  return repositories;
}

// 获取仓库的所有分支
async function getRepositoryBranches(repoPath) {
  try {
    const { stdout } = await execAsync(
      'git branch -a | grep -v "HEAD" | sed "s/^[* ]*//;s/remotes\\///"',
      { cwd: repoPath, maxBuffer: 1024 * 1024 * 10 }
    );
    
    const branches = stdout
      .split('\n')
      .map(branch => branch.trim())
      .filter(branch => branch.length > 0);
    
    // 去重
    return [...new Set(branches)];
  } catch (error) {
    console.error(`获取分支失败 (${repoPath}):`, error.message);
    return [];
  }
}

// 获取仓库的所有提交者
async function getRepositoryAuthors(repoPath, branch = '--all') {
  try {
    const branchParam = branch === '--all' ? '--all' : branch;
    const { stdout } = await execAsync(
      `git log ${branchParam} --format="%aN" | sort -u`,
      { cwd: repoPath, maxBuffer: 1024 * 1024 * 10 }
    );
    
    return stdout
      .split('\n')
      .map(author => author.trim())
      .filter(author => author.length > 0);
  } catch (error) {
    console.error(`获取提交者失败 (${repoPath}):`, error.message);
    return [];
  }
}

// 获取特定作者的统计数据
async function getAuthorStats(repoPath, author, branch = '--all') {
  try {
    const branchParam = branch === '--all' ? '--all' : branch;
    
    // 获取代码统计
    const statsCmd = `git log ${branchParam} --author="${author}" --pretty=tformat: --numstat | awk '{ add += $1; subs += $2; loc += $1 - $2 } END { print add "," subs "," loc }'`;
    const { stdout: statsOutput } = await execAsync(statsCmd, {
      cwd: repoPath,
      maxBuffer: 1024 * 1024 * 10
    });
    
    const [added, deleted, total] = statsOutput.trim().split(',').map(n => parseInt(n) || 0);
    
    // 获取提交次数
    const commitsCmd = `git log ${branchParam} --author="${author}" --oneline | wc -l`;
    const { stdout: commitsOutput } = await execAsync(commitsCmd, {
      cwd: repoPath,
      maxBuffer: 1024 * 1024 * 10
    });
    
    const commits = parseInt(commitsOutput.trim()) || 0;
    
    return {
      author,
      added,
      deleted,
      totalChanges: added + deleted,
      commits
    };
  } catch (error) {
    console.error(`获取作者统计失败 (${author} in ${repoPath}):`, error.message);
    return {
      author,
      added: 0,
      deleted: 0,
      totalChanges: 0,
      commits: 0
    };
  }
}

// 分析单个仓库
async function analyzeRepository(repoPath, branch = '--all', sessionId = null) {
  const repoName = path.basename(repoPath);
  const branchDisplay = branch === '--all' ? '所有分支' : branch;
  
  if (sessionId) {
    sendLog(sessionId, `\n🔍 正在分析仓库: ${repoName} (${branchDisplay})`);
  } else {
    console.log(`正在分析仓库: ${repoName} (${branchDisplay})`);
  }
  
  // 获取分支列表
  const branches = await getRepositoryBranches(repoPath);
  
  const authors = await getRepositoryAuthors(repoPath, branch);
  const authorCount = authors.length;
  
  if (sessionId) {
    sendLog(sessionId, `   👥 发现 ${authorCount} 个提交者`);
  } else {
    console.log(`发现 ${authorCount} 个提交者`);
  }
  
  const contributors = [];
  
  for (let i = 0; i < authors.length; i++) {
    const author = authors[i];
    const stats = await getAuthorStats(repoPath, author, branch);
    contributors.push(stats);
    
    if (sessionId) {
      sendLog(sessionId, `   ⚙️  处理中 [${i + 1}/${authorCount}]: ${author}`);
    }
  }
  
  // 按总改动量排序
  contributors.sort((a, b) => b.totalChanges - a.totalChanges);
  
  if (sessionId) {
    const totalChanges = contributors.reduce((sum, c) => sum + c.totalChanges, 0);
    const totalCommits = contributors.reduce((sum, c) => sum + c.commits, 0);
    sendLog(sessionId, `   ✅ 仓库分析完成 - ${formatNumber(totalChanges)} 行改动，${formatNumber(totalCommits)} 次提交`);
  }
  
  return {
    name: repoName,
    path: repoPath,
    branch: branchDisplay,
    branches: branches,
    contributors
  };
}

// 格式化数字
function formatNumber(num) {
  return num?.toLocaleString() || '0';
}

// 主分析接口
app.post('/api/analyze', async (req, res) => {
  try {
    const { folderPath, branch, sessionId } = req.body;
    const selectedBranch = branch || '--all';
    
    if (!folderPath) {
      return res.status(400).json({
        success: false,
        message: '请提供文件夹路径'
      });
    }
    
    // 检查路径是否存在
    try {
      await fs.access(folderPath);
    } catch (error) {
      if (sessionId) {
        sendLog(sessionId, '❌ 文件夹路径不存在或无法访问', 'error');
      }
      return res.status(400).json({
        success: false,
        message: '文件夹路径不存在或无法访问'
      });
    }
    
    if (sessionId) {
      sendLog(sessionId, `\n🚀 开始扫描文件夹: ${folderPath}`);
      sendLog(sessionId, `📋 统计分支: ${selectedBranch === '--all' ? '所有分支' : selectedBranch}`);
    }
    console.log(`开始扫描文件夹: ${folderPath}`);
    
    // 查找所有Git仓库
    const repositories = await findGitRepositories(folderPath, sessionId);
    
    if (sessionId) {
      sendLog(sessionId, `\n📊 扫描完成！发现 ${repositories.length} 个Git仓库\n`);
    }
    console.log(`发现 ${repositories.length} 个Git仓库`);
    
    if (repositories.length === 0) {
      if (sessionId) {
        sendLog(sessionId, '⚠️  未找到Git仓库', 'warning');
        sendLog(sessionId, '✅ 分析完成', 'success');
      }
      return res.json({
        success: true,
        message: '未找到Git仓库',
        data: {
          repositories: [],
          total: {
            repositoryCount: 0,
            contributorCount: 0,
            totalAdded: 0,
            totalDeleted: 0,
            totalChanges: 0,
            totalCommits: 0
          }
        }
      });
    }
    
    // 分析每个仓库
    if (sessionId) {
      sendLog(sessionId, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      sendLog(sessionId, '🔎 开始详细分析...\n');
    }
    
    const repoStats = [];
    for (let i = 0; i < repositories.length; i++) {
      const repoPath = repositories[i];
      if (sessionId) {
        sendLog(sessionId, `[${i + 1}/${repositories.length}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      }
      const stats = await analyzeRepository(repoPath, selectedBranch, sessionId);
      repoStats.push(stats);
    }
    
    // 计算总体统计
    const allContributors = new Set();
    let totalAdded = 0;
    let totalDeleted = 0;
    let totalChanges = 0;
    let totalCommits = 0;
    
    repoStats.forEach(repo => {
      repo.contributors.forEach(contributor => {
        allContributors.add(contributor.author);
        totalAdded += contributor.added;
        totalDeleted += contributor.deleted;
        totalChanges += contributor.totalChanges;
        totalCommits += contributor.commits;
      });
    });
    
    if (sessionId) {
      sendLog(sessionId, '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      sendLog(sessionId, '📈 总体统计结果');
      sendLog(sessionId, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      sendLog(sessionId, `   📁 仓库总数: ${repositories.length}`);
      sendLog(sessionId, `   👥 提交者总数: ${allContributors.size}`);
      sendLog(sessionId, `   ➕ 总添加行数: ${formatNumber(totalAdded)}`);
      sendLog(sessionId, `   ➖ 总删除行数: ${formatNumber(totalDeleted)}`);
      sendLog(sessionId, `   📊 总改动量: ${formatNumber(totalChanges)}`);
      sendLog(sessionId, `   🔄 总提交次数: ${formatNumber(totalCommits)}`);
      sendLog(sessionId, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      sendLog(sessionId, '✨ 所有分析任务已完成！', 'success');
    }
    
    res.json({
      success: true,
      data: {
        repositories: repoStats,
        total: {
          repositoryCount: repositories.length,
          contributorCount: allContributors.size,
          totalAdded,
          totalDeleted,
          totalChanges,
          totalCommits
        }
      }
    });
    
  } catch (error) {
    console.error('分析错误:', error);
    if (req.body.sessionId) {
      sendLog(req.body.sessionId, `❌ 分析错误: ${error.message}`, 'error');
    }
    res.status(500).json({
      success: false,
      message: `服务器错误: ${error.message}`
    });
  }
});

// 单个仓库分析接口
app.post('/api/analyze-repo', async (req, res) => {
  try {
    const { repoPath, branch, sessionId } = req.body;
    const selectedBranch = branch || '--all';
    
    if (!repoPath) {
      return res.status(400).json({
        success: false,
        message: '请提供仓库路径'
      });
    }
    
    // 检查路径是否存在
    try {
      await fs.access(repoPath);
    } catch (error) {
      if (sessionId) {
        sendLog(sessionId, `❌ 仓库路径不存在: ${repoPath}`, 'error');
      }
      return res.status(400).json({
        success: false,
        message: '仓库路径不存在或无法访问'
      });
    }
    
    if (sessionId) {
      sendLog(sessionId, `\n🔄 重新分析仓库: ${path.basename(repoPath)} (${selectedBranch === '--all' ? '所有分支' : selectedBranch})`);
    }
    
    // 分析单个仓库
    const stats = await analyzeRepository(repoPath, selectedBranch, sessionId);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('单个仓库分析错误:', error);
    if (req.body.sessionId) {
      sendLog(req.body.sessionId, `❌ 分析错误: ${error.message}`, 'error');
    }
    res.status(500).json({
      success: false,
      message: `服务器错误: ${error.message}`
    });
  }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 准备接收代码统计请求...`);
});

