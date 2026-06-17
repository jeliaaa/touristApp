import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Helper: redirect to login
  function redirectToLogin(loginPath: string) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    return NextResponse.redirect(url);
  }

  // Facility routes
  if (pathname.startsWith('/facility/') && !pathname.startsWith('/facility/login') && !pathname.startsWith('/facility/register')) {
    if (!user) return redirectToLogin('/facility/login');
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'facility') return redirectToLogin('/facility/login');
  }

  // User routes
  if (pathname.startsWith('/user/') && !pathname.startsWith('/user/login') && !pathname.startsWith('/user/register')) {
    if (!user) return redirectToLogin('/user/login');
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'user') return redirectToLogin('/user/login');
  }

  // Driver routes
  if (pathname.startsWith('/driver/') && !pathname.startsWith('/driver/login') && !pathname.startsWith('/driver/register')) {
    if (!user) return redirectToLogin('/driver/login');
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'driver') return redirectToLogin('/driver/login');
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/facility/:path*',
    '/user/:path*',
    '/driver/:path*',
  ],
};
