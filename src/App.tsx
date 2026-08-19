import { useEffect, useState } from 'react'
import { fetchHotRepos } from './api'
import type { Repo, TimeRange } from './types'

const RANGES: { key: TimeRange; label: string }[] = [
  { key: 'day', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
]

const LANGUAGES = ['', 'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++']

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C++': '#f34b7d',
}

function formatNumber(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export default function App() {
  const [range, setRange] = useState<TimeRange>('week')
  const [language, setLanguage] = useState('')
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetchHotRepos(range, language || undefined)
      .then((data) => {
        if (!cancelled) setRepos(data.items)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [range, language])

  return (
    <div className="app">
      <header className="header">
        <h1>🔥 GitHub 最火项目榜</h1>
        <p className="subtitle">
          按“时间范围内新建 + star 数最高”排序,近似呈现当前最火的新项目
        </p>
      </header>

      <div className="filters">
        <div className="range-tabs">
          {RANGES.map((r) => (
            <button
              key={r.key}
              className={range === r.key ? 'tab active' : 'tab'}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <select
          className="lang-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l || '全部语言'}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="state">加载中…</div>}
      {error && <div className="state error">{error}</div>}
      {!loading && !error && repos.length === 0 && (
        <div className="state">暂无数据</div>
      )}

      <ul className="repo-list">
        {repos.map((repo, i) => (
          <li key={repo.id} className="repo-card">
            <span className="rank">{i + 1}</span>
            <img className="avatar" src={repo.owner.avatar_url} alt={repo.owner.login} />
            <div className="repo-main">
              <a className="repo-name" href={repo.html_url} target="_blank" rel="noreferrer">
                {repo.full_name}
              </a>
              {repo.description && <p className="repo-desc">{repo.description}</p>}
              <div className="repo-meta">
                {repo.language && (
                  <span className="meta-item">
                    <span
                      className="lang-dot"
                      style={{ background: LANG_COLORS[repo.language] || '#ccc' }}
                    />
                    {repo.language}
                  </span>
                )}
                <span className="meta-item">⭐ {formatNumber(repo.stargazers_count)}</span>
                <span className="meta-item">🍴 {formatNumber(repo.forks_count)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <footer className="footer">
        数据来源:GitHub Search API · 仅统计时间范围内新建的仓库
      </footer>
    </div>
  )
}
