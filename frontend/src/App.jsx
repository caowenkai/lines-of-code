import { useState, useRef } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [folderPath, setFolderPath] = useState('')
  const [parentPath, setParentPath] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('--all')
  const [loading, setLoading] = useState(false)
  const [repoStats, setRepoStats] = useState([])
  const [totalStats, setTotalStats] = useState(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFolderName, setSelectedFolderName] = useState('')
  const [usePathBuilder, setUsePathBuilder] = useState(false)
  const fileInputRef = useRef(null)

  // 处理文件夹选择
  const handleFolderSelect = (event) => {
    const files = event.target.files
    if (files && files.length > 0) {
      // 从第一个文件的路径中提取文件夹路径
      const firstFile = files[0]
      // webkitRelativePath 格式: "folder/subfolder/file.txt"
      const relativePath = firstFile.webkitRelativePath
      const folderName = relativePath.split('/')[0]
      
      // 尝试使用 File System Access API 获取完整路径
      if (firstFile.path) {
        // Electron 或某些环境下可能有 path 属性
        const fullPath = firstFile.path.substring(0, firstFile.path.lastIndexOf('/'))
        setFolderPath(fullPath)
        setSelectedFolderName('')
        setUsePathBuilder(false)
        setError('')
      } else {
        // 浏览器环境下，切换到路径构建模式
        setSelectedFolderName(folderName)
        setUsePathBuilder(true)
        // 如果有父路径，自动拼接
        if (parentPath.trim()) {
          const fullPath = parentPath.endsWith('/') 
            ? `${parentPath}${folderName}` 
            : `${parentPath}/${folderName}`
          setFolderPath(fullPath)
        }
        setError('')
      }
    }
  }

  // 打开文件夹选择器
  const openFolderPicker = () => {
    // 检查是否输入了父路径
    if (!parentPath.trim()) {
      setError('请先在上方输入父目录路径（例如：/Users/username/projects）')
      return
    }
    
    // 尝试使用现代的 File System Access API
    if ('showDirectoryPicker' in window) {
      window.showDirectoryPicker()
        .then(async (dirHandle) => {
          // 获取文件夹名称
          const folderName = dirHandle.name
          setSelectedFolderName(folderName)
          setUsePathBuilder(true)
          // 自动拼接完整路径
          const fullPath = parentPath.endsWith('/') 
            ? `${parentPath}${folderName}` 
            : `${parentPath}/${folderName}`
          setFolderPath(fullPath)
          setError('')
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('文件夹选择失败:', err)
          }
        })
    } else {
      // 降级使用传统的 input[type="file"]
      fileInputRef.current?.click()
    }
  }

  // 处理拖放
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const items = e.dataTransfer.items
    if (items && items.length > 0) {
      const item = items[0]
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry()
        if (entry && entry.isDirectory) {
          // 获取文件夹名称
          const folderName = entry.name
          setSelectedFolderName(folderName)
          setUsePathBuilder(true)
          // 如果有父路径，自动拼接
          if (parentPath.trim()) {
            const fullPath = parentPath.endsWith('/') 
              ? `${parentPath}${folderName}` 
              : `${parentPath}/${folderName}`
            setFolderPath(fullPath)
          }
          setError('')
        }
      }
    }
  }

  const handleAnalyze = async () => {
    if (!folderPath.trim()) {
      setError('请输入文件夹路径')
      return
    }

    setLoading(true)
    setError('')
    setRepoStats([])
    setTotalStats(null)

    try {
      const response = await axios.post('/api/analyze', {
        folderPath: folderPath.trim(),
        branch: selectedBranch
      })

      if (response.data.success) {
        setRepoStats(response.data.data.repositories)
        setTotalStats(response.data.data.total)
      } else {
        setError(response.data.message || '分析失败')
      }
    } catch (err) {
      setError(err.response?.data?.message || '请求失败，请确保后端服务已启动')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0'
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📊 代码统计工具</h1>
        <p>自动化统计Git仓库代码量</p>
      </header>

      <div className="container">
        <div className="two-column-layout">
          {/* 左侧：输入配置区 */}
          <div className="left-panel">
            <div className="panel-header">
              <h2>⚙️ 配置分析参数</h2>
            </div>

            {/* 文件夹路径输入 */}
            <div className="config-section">
              <h3>📁 选择文件夹</h3>
              
              <div className="input-group">
                <label htmlFor="folderPath">文件夹完整路径</label>
                <input
                  id="folderPath"
                  type="text"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  placeholder="/Users/username/projects"
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  className="path-input"
                />
              </div>

              {/* 分步输入选项 */}
              <div className="advanced-options">
                <button 
                  className="toggle-btn"
                  onClick={() => setUsePathBuilder(!usePathBuilder)}
                >
                  {usePathBuilder ? '📝 切换到直接输入' : '🔧 使用分步输入'}
                </button>
              </div>

              {usePathBuilder && (
                <div className="path-builder">
                  <div className="input-group">
                    <label htmlFor="parentPath">父目录路径</label>
                    <input
                      id="parentPath"
                      type="text"
                      value={parentPath}
                      onChange={(e) => setParentPath(e.target.value)}
                      placeholder="/Users/username/projects"
                      className="path-input"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>选择子文件夹</label>
                    <button 
                      className="select-folder-btn" 
                      onClick={openFolderPicker}
                      type="button"
                    >
                      📁 打开文件选择器
                    </button>
                    {selectedFolderName && (
                      <div className="selected-info">
                        ✅ 已选择：<strong>{selectedFolderName}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 拖放区域 */}
            {usePathBuilder && (
              <div 
                className={`drop-zone-compact ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <span className="drop-icon">📂</span>
                <span className="drop-text">
                  {isDragging ? '松开选择' : '拖放文件夹'}
                </span>
              </div>
            )}

            {/* 分支选择 */}
            <div className="config-section">
              <h3>🌳 选择分支</h3>
              
              <div className="input-group">
                <select
                  id="branchSelect"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="branch-select"
                >
                  <option value="--all">🌳 所有分支</option>
                  <option value="master">master</option>
                  <option value="main">main</option>
                  <option value="develop">develop</option>
                  <option value="dev">dev</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="customBranch">自定义分支</label>
                <input
                  id="customBranch"
                  type="text"
                  className="branch-input"
                  placeholder="输入其他分支名后按回车..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      setSelectedBranch(e.target.value.trim())
                      e.target.value = ''
                    }
                  }}
                />
              </div>
            </div>

            {/* 分析按钮 */}
            <button 
              className="analyze-btn-large" 
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? '⏳ 分析中...' : '🚀 开始分析'}
            </button>

            {/* 隐藏的文件输入元素 */}
            <input
              ref={fileInputRef}
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleFolderSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* 右侧：使用说明区 */}
          <div className="right-panel">
            <div className="panel-header">
              <h2>💡 使用说明</h2>
            </div>

            <div className="guide-section">
              <div className="guide-item">
                <div className="guide-number">1</div>
                <div className="guide-content">
                  <h4>输入文件夹路径</h4>
                  <p>在左侧输入框中输入要分析的文件夹完整路径</p>
                  <div className="guide-example">
                    <code>/Users/username/projects</code>
                  </div>
                </div>
              </div>

              <div className="guide-item">
                <div className="guide-number">2</div>
                <div className="guide-content">
                  <h4>或使用分步输入</h4>
                  <p>点击"使用分步输入"，先输入父目录，再选择子文件夹</p>
                  <ul>
                    <li>输入父目录路径</li>
                    <li>点击"打开文件选择器"</li>
                    <li>路径自动拼接完成</li>
                  </ul>
                </div>
              </div>

              <div className="guide-item">
                <div className="guide-number">3</div>
                <div className="guide-content">
                  <h4>选择统计分支</h4>
                  <p>选择要统计的Git分支，默认统计所有分支</p>
                  <ul>
                    <li>所有分支：统计全部分支</li>
                    <li>特定分支：只统计该分支</li>
                    <li>自定义：输入任意分支名</li>
                  </ul>
                </div>
              </div>

              <div className="guide-item">
                <div className="guide-number">4</div>
                <div className="guide-content">
                  <h4>开始分析</h4>
                  <p>点击"开始分析"按钮，等待统计完成</p>
                </div>
              </div>
            </div>

            <div className="tips-section">
              <h4>⚠️ 重要提示</h4>
              <ul className="tips-list">
                <li><strong>浏览器限制：</strong>Web浏览器无法自动获取文件系统路径，需手动输入</li>
                <li><strong>路径格式：</strong>必须是绝对路径，如 /Users/xxx/projects</li>
                <li><strong>权限要求：</strong>确保有读取目标文件夹的权限</li>
                <li><strong>大型仓库：</strong>分析可能需要较长时间，请耐心等待</li>
              </ul>
            </div>

            <div className="quick-links">
              <h4>📚 快速链接</h4>
              <a href="./demo-file-info.html" target="_blank" className="link-btn">
                🔬 浏览器限制演示
              </a>
              <a href="#" className="link-btn" onClick={(e) => {
                e.preventDefault()
                alert('功能文档：详见 README.md 和 BRANCH_FEATURE.md')
              }}>
                📖 查看完整文档
              </a>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {totalStats && (
          <div className="summary-card">
            <h2>📈 总体统计</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">仓库总数</span>
                <span className="summary-value">{totalStats.repositoryCount}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">提交者总数</span>
                <span className="summary-value">{totalStats.contributorCount}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">总添加行数</span>
                <span className="summary-value add">{formatNumber(totalStats.totalAdded)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">总删除行数</span>
                <span className="summary-value delete">{formatNumber(totalStats.totalDeleted)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">总改动量</span>
                <span className="summary-value total">{formatNumber(totalStats.totalChanges)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">总提交次数</span>
                <span className="summary-value">{formatNumber(totalStats.totalCommits)}</span>
              </div>
            </div>
          </div>
        )}

        {repoStats.length > 0 && (
          <div className="repos-section">
            {repoStats.map((repo, index) => (
              <div key={index} className="repo-card">
                <h3 className="repo-title">
                  🗂️ {repo.name}
                  <span className="repo-branch">📌 {repo.branch}</span>
                  <span className="repo-path">{repo.path}</span>
                  {repo.branches && repo.branches.length > 0 && (
                    <span className="repo-branches-info">
                      🌿 共 {repo.branches.length} 个分支
                    </span>
                  )}
                </h3>
                
                {repo.contributors.length === 0 ? (
                  <div className="no-data">该仓库暂无提交记录</div>
                ) : (
                  <div className="table-container">
                    <table className="stats-table">
                      <thead>
                        <tr>
                          <th>排名</th>
                          <th>提交者</th>
                          <th className="number-col">添加行数</th>
                          <th className="number-col">删除行数</th>
                          <th className="number-col">总改动量</th>
                          <th className="number-col">提交次数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {repo.contributors.map((contributor, idx) => (
                          <tr key={idx}>
                            <td className="rank">
                              {idx === 0 && <span className="medal">🥇</span>}
                              {idx === 1 && <span className="medal">🥈</span>}
                              {idx === 2 && <span className="medal">🥉</span>}
                              {idx > 2 && <span>{idx + 1}</span>}
                            </td>
                            <td className="author">{contributor.author}</td>
                            <td className="number-col add">+{formatNumber(contributor.added)}</td>
                            <td className="number-col delete">-{formatNumber(contributor.deleted)}</td>
                            <td className="number-col total">{formatNumber(contributor.totalChanges)}</td>
                            <td className="number-col">{formatNumber(contributor.commits)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && repoStats.length === 0 && !error && (
          <div className="placeholder">
            <p>✨ 开始使用</p>
            <p className="placeholder-hint">
              1️⃣ 点击"📁 选择"按钮选择文件夹<br/>
              2️⃣ 或拖放文件夹到上方区域<br/>
              3️⃣ 或直接输入文件夹完整路径<br/>
              4️⃣ 点击"开始分析"按钮
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
