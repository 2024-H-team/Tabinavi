import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    if (pathname.startsWith('/_next') || pathname.startsWith('/static')) {
        return NextResponse.next();
    }
    const token = request.cookies.get('token')?.value;

    if (!token && !PUBLIC_PATHS.includes(pathname)) {
        const url = new URL('/', request.url);
        return NextResponse.redirect(url);
    }

    if (token && PUBLIC_PATHS.includes(pathname)) {
        const url = new URL('/home', request.url);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}
