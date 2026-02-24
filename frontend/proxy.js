import { NextResponse } from "next/server";

export default function proxy(request) {
    const tfa_token = request.cookies.get("tfa_token")?.value;
    const access_token = request.cookies.get("access_token")?.value;
    const { pathname } = request.nextUrl;

    if (access_token && pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (!access_token && pathname === "/") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (access_token && pathname.startsWith("/login")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!access_token && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!tfa_token && pathname === "/login/tfa") {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/", "/login/:path*", "/dashboard/:path*"],
};
