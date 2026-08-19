export interface Repo {
  id: number
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  created_at: string
  owner: {
    login: string
    avatar_url: string
    html_url: string
  }
  dailyStars?: number
}

export interface SearchResponse {
  total_count: number
  items: Repo[]
}

export type TimeRange = 'day' | 'week' | 'month'
