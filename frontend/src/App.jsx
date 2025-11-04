import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [folderPath, setFolderPath] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('--all')
  const [loading, setLoading] = useState(false)
  const [repoStats, setRepoStats] = useState([])
  const [totalStats, setTotalStats] = useState(null)
  const [error, setError] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [logs, setLogs] = useState([])
  const [showTerminal, setShowTerminal] = useState(false)
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false)
  const [repoLoadingStates, setRepoLoadingStates] = useState({}) // 记录每个仓库的加载状态
  const eventSourceRef = useRef(null)
  const logsEndRef = useRef(null)
  const sessionIdRef = useRef(null)

  // 自动滚动到日志底部
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // 清理EventSource连接
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  // 连接到日志SSE服务
  const connectToLogStream = (sessionId) => {
    // 关闭之前的连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const logUrl = `/api/logs/${sessionId}`
    console.log('🔌 连接到日志服务:', logUrl)
    
    const eventSource = new EventSource(logUrl)
    
    eventSource.onopen = () => {
      console.log('✅ SSE连接已建立')
    }
    
    eventSource.onmessage = (event) => {
      console.log('📨 收到日志:', event.data)
      try {
        const data = JSON.parse(event.data)
        setLogs(prev => [...prev, {
          message: data.message,
          type: data.type,
          timestamp: new Date(data.timestamp)
        }])
      } catch (err) {
        console.error('❌ 解析日志数据失败:', err)
      }
    }

    eventSource.onerror = (error) => {
      console.error('❌ SSE连接错误:', error)
      console.log('EventSource状态:', eventSource.readyState)
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('SSE连接已关闭')
      }
    }

    eventSourceRef.current = eventSource
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
    setLogs([])
    setShowTerminal(true)
    setIsTerminalMinimized(false) // 开始分析时自动展开终端

    // 生成唯一的会话ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionIdRef.current = sessionId
    
    console.log('🆔 会话ID:', sessionId)

    // 连接到日志流
    connectToLogStream(sessionId)

    try {
      const response = await axios.post('/api/analyze', {
        folderPath: folderPath.trim(),
        branch: selectedBranch,
        sessionId: sessionId
      })

      if (response.data.success) {
        // 为每个仓库添加当前选中的分支（默认为所有分支）
        const reposWithBranch = response.data.data.repositories.map(repo => ({
          ...repo,
          currentBranch: '--all'
        }))
        setRepoStats(reposWithBranch)
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

  // 重新分析单个仓库
  const handleReanalyzeRepo = async (repoIndex, repoPath, branch) => {
    const repoKey = `${repoPath}_${branch}`
    setRepoLoadingStates(prev => ({ ...prev, [repoKey]: true }))
    
    // 自动展开终端窗口
    if (sessionIdRef.current) {
      setShowTerminal(true)
      setIsTerminalMinimized(false)
    }
    
    try {
      const response = await axios.post('/api/analyze-repo', {
        repoPath: repoPath,
        branch: branch,
        sessionId: sessionIdRef.current
      })

      if (response.data.success) {
        // 更新该仓库的数据
        setRepoStats(prev => {
          const newStats = [...prev]
          newStats[repoIndex] = {
            ...response.data.data,
            currentBranch: branch
          }
          return newStats
        })
        
        // 重新计算总体统计
        recalculateTotalStats()
      } else {
        setError(response.data.message || '重新分析失败')
      }
    } catch (err) {
      setError(err.response?.data?.message || '重新分析失败')
    } finally {
      setRepoLoadingStates(prev => ({ ...prev, [repoKey]: false }))
    }
  }

  // 重新计算总体统计
  const recalculateTotalStats = () => {
    if (repoStats.length === 0) return

    const allContributors = new Set()
    let totalAdded = 0
    let totalDeleted = 0
    let totalChanges = 0
    let totalCommits = 0

    repoStats.forEach(repo => {
      repo.contributors.forEach(contributor => {
        allContributors.add(contributor.author)
        totalAdded += contributor.added
        totalDeleted += contributor.deleted
        totalChanges += contributor.totalChanges
        totalCommits += contributor.commits
      })
    })

    setTotalStats({
      repositoryCount: repoStats.length,
      contributorCount: allContributors.size,
      totalAdded,
      totalDeleted,
      totalChanges,
      totalCommits
    })
  }

  const clearLogs = () => {
    setLogs([])
  }

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return '#4ade80'
      case 'error': return '#f87171'
      case 'warning': return '#fbbf24'
      default: return '#94a3b8'
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

      <div className="app-layout">
        <div className="main-content">
        {/* 简化的输入区 */}
        <div className="simple-input-section">
          <div className="input-card">
            <div className="input-group">
              <label htmlFor="folderPath">📂 文件夹路径</label>
              <input
                id="folderPath"
                type="text"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="粘贴文件夹完整路径，如：/Users/username/projects"
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                className="path-input-simple"
              />
              <p className="input-hint">
                ⚠️ 浏览器无法自动获取文件系统路径，请手动粘贴完整路径
                <button 
                  className="help-link"
                  onClick={() => setShowHelp(true)}
                >
                  查看如何获取路径 →
                </button>
              </p>
            </div>

            <div className="input-group">
              <label htmlFor="branchSelect">🌳 统计分支</label>
              <select
                id="branchSelect"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="branch-select-simple"
              >
                <option value="--all">所有分支</option>
                <option value="master">master</option>
                <option value="main">main</option>
                <option value="develop">develop</option>
                <option value="dev">dev</option>
              </select>
            </div>

            <button 
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? '⏳ 分析中...' : '🚀 开始分析'}
            </button>
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
            {repoStats.map((repo, index) => {
              const repoKey = `${repo.path}_${repo.currentBranch}`
              const isRepoLoading = repoLoadingStates[repoKey]
              
              return (
                <div key={index} className={`repo-card ${isRepoLoading ? 'loading' : ''}`}>
                  <div className="repo-header">
                    <div className="repo-title-section">
                      <h3 className="repo-title">
                        🗂️ {repo.name}
                      </h3>
                      <span className="repo-path">{repo.path}</span>
                    </div>
                    
                    <div className="repo-branch-selector">
                      <label htmlFor={`branch-${index}`} className="branch-label">
                        🌳 分支:
                      </label>
                      <select
                        id={`branch-${index}`}
                        value={repo.currentBranch || '--all'}
                        onChange={(e) => handleReanalyzeRepo(index, repo.path, e.target.value)}
                        className="branch-select"
                        disabled={isRepoLoading}
                      >
                        <option value="--all">所有分支</option>
                        {repo.branches && repo.branches.map((branch, idx) => (
                          <option key={idx} value={branch}>{branch}</option>
                        ))}
                      </select>
                      {isRepoLoading && <span className="loading-spinner">⏳</span>}
                    </div>
                  </div>
                  
                  {/* 加载遮罩 */}
                  {isRepoLoading && (
                    <div className="repo-loading-overlay">
                      <div className="loading-content">
                        <div className="loading-spinner-large">🔄</div>
                        <p className="loading-text">正在重新分析分支数据...</p>
                        <p className="loading-subtext">
                          分支: {repo.currentBranch === '--all' ? '所有分支' : repo.currentBranch}
                        </p>
                      </div>
                    </div>
                  )}
                
                {!isRepoLoading && repo.contributors.length === 0 ? (
                  <div className="no-data">该仓库暂无提交记录</div>
                ) : !isRepoLoading ? (
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
                ) : (
                  /* 骨架屏 */
                  <div className="skeleton-table">
                    <div className="skeleton-row skeleton-header"></div>
                    <div className="skeleton-row"></div>
                    <div className="skeleton-row"></div>
                    <div className="skeleton-row"></div>
                    <div className="skeleton-row"></div>
                  </div>
                )}
                </div>
              )
            })}
          </div>
        )}

        {!loading && repoStats.length === 0 && !error && (
          <div className="placeholder">
            <p>✨ 开始使用</p>
            <p className="placeholder-hint">
              粘贴文件夹路径 → 选择分支 → 点击分析
            </p>
          </div>
        )}
        </div>

        {/* 终端日志窗口 */}
        {showTerminal && (
          <div className={`terminal-panel ${isTerminalMinimized ? 'minimized' : ''}`}>
            <div className="terminal-header">
              <div className="terminal-title">
                <span className="terminal-icon">💻</span>
                <span>实时日志</span>
                {isTerminalMinimized && logs.length > 0 && (
                  <span className="log-count">{logs.length}</span>
                )}
              </div>
              <div className="terminal-actions">
                <button 
                  className="terminal-btn"
                  onClick={() => setIsTerminalMinimized(!isTerminalMinimized)}
                  title={isTerminalMinimized ? "展开" : "最小化"}
                >
                  {isTerminalMinimized ? '⬆️' : '⬇️'}
                </button>
                <button 
                  className="terminal-btn"
                  onClick={clearLogs}
                  title="清空日志"
                >
                  🗑️
                </button>
                <button 
                  className="terminal-btn"
                  onClick={() => setShowTerminal(false)}
                  title="关闭终端"
                >
                  ✕
                </button>
              </div>
            </div>
            {!isTerminalMinimized && (
              <div className="terminal-body">
                {logs.length === 0 ? (
                  <div className="terminal-empty">
                    等待日志输出...
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div 
                      key={index} 
                      className="terminal-log"
                      style={{ color: getLogColor(log.type) }}
                    >
                      <span className="log-time">
                        [{log.timestamp.toLocaleTimeString()}]
                      </span>
                      <span className="log-message">{log.message}</span>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        )}

        {/* 终端切换按钮（当终端关闭时显示） */}
        {!showTerminal && logs.length > 0 && (
          <button 
            className="terminal-toggle-btn"
            onClick={() => setShowTerminal(true)}
            title="显示终端日志"
          >
            💻 日志
          </button>
        )}
      </div>

      {/* 使用说明弹窗 */}
      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💡 使用说明</h2>
              <button className="close-btn" onClick={() => setShowHelp(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <section className="help-section">
                <h3>📂 如何获取文件夹路径？</h3>
                
                <div className="help-item">
                  <h4>🍎 macOS 用户</h4>
                  <ol>
                    <li>在「访达」中找到目标文件夹</li>
                    <li>右键点击文件夹</li>
                    <li>按住 <kbd>Option</kbd> 键</li>
                    <li>选择「拷贝"文件夹名"作为路径名称」</li>
                    <li>粘贴到路径输入框</li>
                  </ol>
                  <div className="path-example">
                    示例：<code>/Users/username/projects</code>
                  </div>
                </div>

                <div className="help-item">
                  <h4>🪟 Windows 用户</h4>
                  <ol>
                    <li>在「文件资源管理器」中打开文件夹</li>
                    <li>点击地址栏（或按 <kbd>Ctrl+L</kbd>）</li>
                    <li>路径会被全选，<kbd>Ctrl+C</kbd> 复制</li>
                    <li>粘贴到路径输入框</li>
                  </ol>
                  <div className="path-example">
                    示例：<code>C:\Users\username\projects</code>
                  </div>
                </div>

                <div className="help-item">
                  <h4>🐧 Linux 用户</h4>
                  <ol>
                    <li>在文件管理器中右键点击文件夹</li>
                    <li>选择「复制路径」或「属性」查看路径</li>
                    <li>或在终端使用 <code>pwd</code> 命令</li>
                  </ol>
                  <div className="path-example">
                    示例：<code>/home/username/projects</code>
                  </div>
                </div>
              </section>

              <section className="help-section">
                <h3>⚠️ 重要提示</h3>
                <ul className="tips-list">
                  <li><strong>浏览器限制：</strong>由于浏览器安全策略，Web应用无法直接访问您的文件系统路径，必须手动输入</li>
                  <li><strong>绝对路径：</strong>必须输入完整的绝对路径，不能使用相对路径（如 <code>./folder</code>）</li>
                  <li><strong>读取权限：</strong>确保您对目标文件夹有读取权限</li>
                  <li><strong>耗时说明：</strong>大型仓库或多个仓库的分析可能需要较长时间，请耐心等待</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>🌳 分支选择说明</h3>
                <ul className="tips-list">
                  <li><strong>所有分支：</strong>统计仓库中所有分支的代码提交</li>
                  <li><strong>指定分支：</strong>只统计选定分支的代码提交</li>
                  <li><strong>使用场景：</strong>如果只关心主分支代码量，选择 main 或 master</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>📊 统计指标说明</h3>
                <ul className="tips-list">
                  <li><strong>添加行数：</strong>该提交者新增的代码行数</li>
                  <li><strong>删除行数：</strong>该提交者删除的代码行数</li>
                  <li><strong>总改动量：</strong>添加 + 删除的总和，衡量代码活跃度</li>
                  <li><strong>提交次数：</strong>Git commit 的总次数</li>
                </ul>
              </section>
            </div>

            <div className="modal-footer">
              <button className="close-btn-large" onClick={() => setShowHelp(false)}>
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
