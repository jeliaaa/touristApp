import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const LOCALES = routing.locales as readonly string[];

const ROLE_HOME: Record<string, string> = {
  facility: '/facility/dashboard',
  driver:   '/driver/qr',
  user:     '/user/restaurants',
};

// Paths (without locale prefix) that signed-in users must not visit
const GUEST_ONLY = [
  '', '/',
  '/user/login', '/user/register',
  '/facility/login', '/facility/register',
  '/driver/login', '/driver/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Detect locale from URL (first segment)
  const segments = pathname.split('/');
  const firstSeg = segments[1] ?? '';
  const hasLocale = LOCALES.includes(firstSeg);
  const pathWithoutLocale = hasLocale ? '/' + segments.slice(2).join('/') : pathname;
  const currentLocale = hasLocale ? firstSeg : routing.defaultLocale;

  // --- Supabase session refresh ---
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  // --- Auth guard: redirect signed-in users away from guest-only pages ---
  const normalized = pathWithoutLocale.replace(/\/$/, '') || '/';
  const isGuestOnly = GUEST_ONLY.includes(normalized);

  if (user && isGuestOnly) {
    const role = (user.user_metadata?.role as string) ?? 'user';
    const dest = ROLE_HOME[role] ?? '/user/restaurants';
    return NextResponse.redirect(new URL(`/${currentLocale}${dest}`, request.url));
  }

  // --- next-intl handles locale detection & prefixing ---
  const intlResponse = intlMiddleware(request);

  // Merge Supabase session cookies into the intl response
  supabaseResponse.cookies.getAll().forEach(cookie => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      maxAge: cookie.maxAge,
      path: cookie.path,
    });
  });

  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
