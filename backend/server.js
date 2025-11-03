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

// 查找所有Git仓库
async function findGitRepositories(rootPath) {
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
            repositories.push(path.dirname(fullPath));
          } else {
            // 递归搜索子目录
            await searchDirectory(fullPath);
          }
        }
      }
    } catch (error) {
      // 忽略无权限访问的目录
      console.log(`无法访问目录: ${dirPath}`);
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
async function analyzeRepository(repoPath, branch = '--all') {
  const repoName = path.basename(repoPath);
  const branchDisplay = branch === '--all' ? '所有分支' : branch;
  console.log(`正在分析仓库: ${repoName} (${branchDisplay})`);
  
  // 获取分支列表
  const branches = await getRepositoryBranches(repoPath);
  
  const authors = await getRepositoryAuthors(repoPath, branch);
  console.log(`发现 ${authors.length} 个提交者`);
  
  const contributors = [];
  
  for (const author of authors) {
    const stats = await getAuthorStats(repoPath, author, branch);
    contributors.push(stats);
  }
  
  // 按总改动量排序
  contributors.sort((a, b) => b.totalChanges - a.totalChanges);
  
  return {
    name: repoName,
    path: repoPath,
    branch: branchDisplay,
    branches: branches,
    contributors
  };
}

// 主分析接口
app.post('/api/analyze', async (req, res) => {
  try {
    const { folderPath, branch } = req.body;
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
      return res.status(400).json({
        success: false,
        message: '文件夹路径不存在或无法访问'
      });
    }
    
    console.log(`开始扫描文件夹: ${folderPath}`);
    
    // 查找所有Git仓库
    const repositories = await findGitRepositories(folderPath);
    console.log(`发现 ${repositories.length} 个Git仓库`);
    
    if (repositories.length === 0) {
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
    const repoStats = [];
    for (const repoPath of repositories) {
      const stats = await analyzeRepository(repoPath, selectedBranch);
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

