import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getSession でローカルのCookieから読む（ネットワーク不要）
  const { data: { session } } = await supabase.auth.getSession()

  const isSchedulePage = request.nextUrl.pathname.startsWith("/schedule")
  const isAuthPage = ["/login", "/signup"].includes(request.nextUrl.pathname)

  if (isSchedulePage && !session) {
    console.log("[middleware] 未認証 → /login にリダイレクト")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthPage && session) {
    console.log("[middleware] 認証済み → /schedule にリダイレクト")
    return NextResponse.redirect(new URL("/schedule", request.url))
  }

  return response
}

export const config = {
  matcher: ["/schedule", "/schedule/:path*", "/login", "/signup"],
}
