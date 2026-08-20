"use client";

import ImageUpload from "@/components/ImageUpload";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

interface CategoriesResponse {
  success: boolean;
  error?: string;
  count: number;
  data: Category[];
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoriesManagement() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/categories");
      const json: CategoriesResponse = await res.json();

      if (!json.success) {
        setError(json.error ?? "Failed to load categories");
        return;
      }

      setCategories(json.data);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchCategories(), 0);

    return () => clearTimeout(id);
  }, [fetchCategories]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setSlugTouched(false);
    setShowModal(true);
  }

  function openEdit(category: Category) {
    setEditingId(category._id);

    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
    });

    setSlugTouched(true);
    setShowModal(true);
  }

  function handleNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const url = editingId
        ? `/api/categories/${editingId}`
        : "/api/categories";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? "Failed to save category");
        return;
      }

      setShowModal(false);
      fetchCategories();
    } catch {
      setError("Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? This can't be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? "Failed to delete category");
        return;
      }

      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError("Failed to delete category");
    }
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
              Categories
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {categories.length} categories
            </p>
          </div>

          <button
            onClick={openAdd}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Add Category
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

        {loading ? (
          <p className="py-12 text-center text-gray-400">
            Loading categories...
          </p>
        ) : categories.length === 0 ? (
          <p className="py-12 text-center text-gray-400">
            No categories yet. Add one to get started.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category._id}
                className="rounded-xl bg-white p-5 shadow-sm"
              >
                <p className="font-semibold text-slate-900">
                  {category.name}
                </p>

                <p className="text-sm text-gray-400">
                  {category.slug}
                </p>

                {category.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {category.description}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(category)}
                    className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium hover:bg-gray-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(category._id)}
                    className="flex-1 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6">
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Name
                  </label>

                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-600"
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
                    onChange={(e) => {
                      setSlugTouched(true);

                      setForm((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }));
                    }}
                    className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Description{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>

                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Category Image{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>

                  <ImageUpload
                    value={form.image}
                    onChange={(image) =>
                      setForm((prev) => ({
                        ...prev,
                        image,
                      }))
                    }
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 py-2.5 font-medium hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}