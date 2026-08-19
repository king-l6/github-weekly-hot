const CACHE_KEY = 'gh-hot-translations'

function loadCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveCache(cache: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage 满或不可用时静默忽略
  }
}

const cache = loadCache()

function hasChinese(text: string): boolean {
  return /[一-鿿]/.test(text)
}

export async function translateToZh(text: string): Promise<string> {
  if (!text || hasChinese(text)) return text
  if (cache[text]) return cache[text]

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text,
    )}&langpair=en|zh-CN`
    const res = await fetch(url)
    if (!res.ok) return text
    const data = await res.json()
    const translated: string | undefined = data?.responseData?.translatedText
    if (data?.responseStatus !== 200 || !translated) return text

    cache[text] = translated
    saveCache(cache)
    return translated
  } catch {
    return text
  }
}
