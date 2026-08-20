"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import MultiImageUpload from "@/components/MultiImageUpload";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  featured: boolean;
  sku: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductsResponse {
  success: boolean;
  error?: string;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Product[];
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  category: "",
  images: [] as string[],
  stock: 0,
  featured: false,
  sku: "",
};

export default function ProductsManagement() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);

      params.set("page", String(page));
      params.set("limit", "10");

      const res = await fetch(`/api/products?${params.toString()}`);
      const json: ProductsResponse = await res.json();

      if (!json.success) {
        throw new Error(json.error ?? "Failed to load products");
      }

      setProducts(json.data);
      setTotalPages(json.totalPages);
      setTotal(json.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();

      if (json.success) {
        setCategories(json.data);
      }
    } catch {
      // categories optional — filter still works without them
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    fetchCategories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProducts]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  function openEdit(product: Product) {
    setEditingId(product._id);

    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images,
      stock: product.stock,
      featured: product.featured,
      sku: product.sku,
    });

    setFormError("");
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setFormError("");

    const body = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      images: form.images.filter(Boolean),
      stock: Number(form.stock),
      featured: form.featured,
      sku: form.sku,
    };

    try {
      const url = editingId
        ? `/api/products/${editingId}`
        : "/api/products";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error ?? "Failed to save product");
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error ?? "Failed to delete product");
      }

      fetchProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete product"
      );
    }
  }

  async function toggleFeatured(product: Product) {
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          featured: !product.featured,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error ?? "Failed to update product");
      }

      fetchProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update product"
      );
    }
  }

  async function updateStock(product: Product, newStock: number) {
    if (newStock < 0) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock: newStock,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error ?? "Failed to update stock");
      }

      fetchProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update stock"
      );
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Products Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {total} products total
            </p>
          </div>

          <button
            onClick={openAdd}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Add Product
          </button>
        </div>

        <div className="mb-6 flex justify-end">
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-500 hover:text-red-600"
          >
            Log out
          </button>
        </div>

        <AdminNav />

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Search & Filter */}
        <div className="mb-6 flex flex-wrap gap-4">
          <form
            onSubmit={handleSearchSubmit}
            className="min-w-[200px] flex-1"
          >
            <input
              type="text"
              placeholder="Search by name, SKU, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-600"
            />
          </form>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-600"
          >
            <option value="">All Categories</option>

            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full">
            <thead className="border-b bg-gray-50 text-left text-sm text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Featured</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="text-sm hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {product.name}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {product.sku}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {product.category}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      Rs. {product.price.toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateStock(product, product.stock - 1)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                          −
                        </button>

                        <span className="w-10 text-center text-gray-700">
                          {product.stock}
                        </span>

                        <button
                          onClick={() =>
                            updateStock(product, product.stock + 1)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleFeatured(product)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          product.featured
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.featured
                          ? "Featured"
                          : "Not Featured"}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(product._id)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() =>
                setPage((p) => Math.max(1, p - 1))
              }
              disabled={page === 1}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={page === totalPages}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold">
              {editingId ? "Edit Product" : "Add Product"}
            </h2>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Name
                  </label>

                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Slug
                  </label>

                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        slug: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Price (Rs.)
                  </label>

                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    SKU
                  </label>

                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sku: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Category
                  </label>

                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-600"
                  >
                    <option value="">Select category</option>

                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Stock
                  </label>

                  <input
                    type="number"
                    required
                    min={0}
                    value={form.stock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <MultiImageUpload
                value={form.images}
                onChange={(images) =>
                  setForm({
                    ...form,
                    images,
                  })
                }
                label="Product Images"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      featured: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />

                <span className="text-sm font-medium">
                  Featured product
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update"
                      : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}