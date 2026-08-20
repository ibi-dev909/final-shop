"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import type { Product, Category } from "@/types/product";

interface ProductsResponse {
  success: boolean;
  error?: string;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Product[];
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch {
      // categories optional
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      params.set("page", String(page));
      params.set("limit", "12");

      const res = await fetch(`/api/products?${params.toString()}`);
      const json: ProductsResponse = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to load products");
      setProducts(json.data);
      setTotalPages(json.totalPages);
      setTotal(json.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  useEffect(() => {
    const id = setTimeout(() => fetchCategories(), 0);
    return () => clearTimeout(id);
  }, [fetchCategories]);

  useEffect(() => {
    const id = setTimeout(() => fetchProducts(), 0);
    return () => clearTimeout(id);
  }, [fetchProducts]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  }

  return (
    <>
      <Navbar />

      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-4xl font-bold md:text-5xl">Shop</h1>
          <p className="mt-3 text-gray-300">
            Browse our full collection of sports equipment and toys.
          </p>
        </div>
      </section>

      <section className="bg-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-6">

          {/* Search & Filter */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-600"
              />
            </form>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-600"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <p className="mb-6 text-sm text-gray-500">
            {loading ? "Loading..." : `${total} product${total !== 1 ? "s" : ""} found`}
          </p>

          {/* Product Grid */}
          {loading ? (
            <div className="py-20 text-center text-gray-400">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-400">No products found.</p>
              <Link
                href="/shop"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("");
                  setPage(1);
                }}
                className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </>
  );
}

function ShopPageFallback() {
  return (
    <>
      <Navbar />
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-gray-400">Loading products...</p>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageFallback />}>
      <ShopPageContent />
    </Suspense>
  );
}
