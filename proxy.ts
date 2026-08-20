import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken, ADMIN_SESSION_COOKIE } from "@/lib/session";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authed = await isValidSessionToken(token);

  // Protect the admin UI itself (but not the login page, or you can never log in)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!authed) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Protect writes to products/categories. GET stays public — anyone should
  // be able to browse the storefront, just not create/edit/delete.
  const isProductOrCategoryApi =
    pathname.startsWith("/api/products") || pathname.startsWith("/api/categories");

  if (isProductOrCategoryApi && MUTATING_METHODS.has(req.method) && !authed) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Orders are the opposite: POST is public (customers checking out without
  // an account), but reading/updating the list is admin-only — it holds
  // customer names, phone numbers, and addresses.
  if (pathname.startsWith("/api/orders") && req.method !== "POST" && !authed) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/products/:path*",
    "/api/categories/:path*",
    "/api/orders/:path*",
  ],
};
