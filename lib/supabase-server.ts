import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const PROJECT_REF = 'vljowdgljjdykmxgvtpb'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function extractAccessToken(): string | null {
  try {
    const cookieStore = cookies()

    // Chercher le token principal
    const mainCookie = cookieStore.get(`sb-${PROJECT_REF}-auth-token`)
    if (mainCookie?.value) {
      try {
        const parsed = JSON.parse(decodeURIComponent(mainCookie.value))
        if (parsed?.access_token) return parsed.access_token
      } catch {}
      try {
        const parsed = JSON.parse(Buffer.from(mainCookie.value, 'base64').toString())
        if (parsed?.access_token) return parsed.access_token
      } catch {}
    }

    // Chercher les cookies fragmentés (.0, .1, ...)
    const allCookies = cookieStore.getAll()
    const chunks: string[] = []
    let i = 0
    while (true) {
      const chunk = allCookies.find(c => c.name === `sb-${PROJECT_REF}-auth-token.${i}`)
      if (!chunk) break
      chunks.push(chunk.value)
      i++
    }

    if (chunks.length > 0) {
      const joined = chunks.join('')
      try {
        const parsed = JSON.parse(decodeURIComponent(joined))
        if (parsed?.access_token) return parsed.access_token
      } catch {}
      try {
        const parsed = JSON.parse(Buffer.from(joined, 'base64').toString())
        if (parsed?.access_token) return parsed.access_token
      } catch {}
    }

    return null
  } catch {
    return null
  }
}

export async function getUser() {
  try {
    const token = extractAccessToken()
    if (!token) return null

    const supabase = getAdminClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null
    return user
  } catch {
    return null
  }
}

export async function getUserProfile(userId: string) {
  try {
    const supabase = getAdminClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data
  } catch {
    return null
  }
}
