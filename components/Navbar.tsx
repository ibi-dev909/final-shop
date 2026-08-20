"use client";

import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { itemCount } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold">
            HB
          </div>

          <div>
            <h1 className="text-xl font-bold">
              Haq Brothers
            </h1>

            <p className="text-xs text-gray-300">
              Sports & Toy Shop
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="hidden gap-8 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-blue-400 transition">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}

        <div className="flex items-center gap-4">

          <Link href="/admin/login" className="rounded-lg border border-gray-600 px-4 py-2 hover:bg-blue-600 transition">
            Login
          </Link>

          <Link
            href="/cart"
            className="relative rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700 transition"
          >
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold">
                {itemCount}
              </span>
            )}
          </Link>

        </div>

      </div>
    </nav>
  );
}
