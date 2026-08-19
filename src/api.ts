import type { SearchResponse, TimeRange } from './types'

function startDateFor(range: TimeRange): string {
  const now = new Date()
  const days = range === 'day' ? 1 : range === 'week' ? 7 : 30
  now.setDate(now.getDate() - days)
  return now.toISOString().slice(0, 10)
}

export async function fetchHotRepos(
  range: TimeRange,
  language?: string,
): Promise<SearchResponse> {
  const parts = [`created:>${startDateFor(range)}`]
  if (language) parts.push(`language:${language}`)
  const q = encodeURIComponent(parts.join(' '))
  const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=30`

  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  })

  if (!res.ok) {
    if (res.status === 403 && res.headers.get('X-RateLimit-Remaining') === '0') {
      throw new Error('GitHub API 请求过于频繁,已触发限速。请稍等一分钟后再试。')
    }
    throw new Error(`请求失败:${res.status} ${res.statusText}`)
  }

  return res.json()
}
