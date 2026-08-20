import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import AddToCartButton from "@/components/AddToCartButton";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import type { Product as ProductType } from "@/types/product";

interface PageProps {
  params: Promise<{ id: string }>;
}

function toProduct(doc: unknown): ProductType {
  const d = doc as Record<string, unknown>;
  return {
    _id: (d._id as { toString(): string }).toString(),
    name: d.name as string,
    slug: d.slug as string,
    description: d.description as string,
    price: d.price as number,
    category: d.category as string,
    images: d.images as string[],
    stock: d.stock as number,
    featured: d.featured as boolean,
    sku: d.sku as string,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  await dbConnect();

  const doc = await Product.findById(id).lean();
  if (!doc) notFound();

  const product = toProduct(doc);

  const relatedDocs = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const related = relatedDocs.map(toProduct);

  const image =
    product.images[0] ?? "https://placehold.co/600x600?text=No+Image";

  return (
    <>
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-4">
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-blue-600">
              Shop
            </Link>
            <span>/</span>
            <span className="text-slate-900">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">

            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
              <Image
                src={image}
                alt={product.name}
                fill
                unoptimized={image.startsWith("data:")}
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div>
              <span className="text-sm font-medium text-blue-600">
                {product.category}
              </span>

              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                {product.name}
              </h1>

              <p className="mt-4 text-3xl font-bold text-slate-900">
                Rs. {product.price.toLocaleString()}
              </p>

              <p className="mt-6 text-gray-600 leading-relaxed">
                {product.description}
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex gap-2">
                  <span className="font-semibold text-slate-900">SKU:</span>
                  <span className="text-gray-600">{product.sku}</span>
                </div>

                <div className="flex gap-2">
                  <span className="font-semibold text-slate-900">
                    Availability:
                  </span>
                  <span
                    className={
                      product.stock > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {product.stock > 0
                      ? `In Stock (${product.stock})`
                      : "Out of Stock"}
                  </span>
                </div>

                {product.featured && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-slate-900">
                      Featured:
                    </span>
                    <span className="text-green-600">Yes</span>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-4">
                <AddToCartButton product={product} />

                <Link
                  href="/shop"
                  className="rounded-xl border border-gray-300 px-8 py-4 text-lg font-semibold transition hover:bg-gray-100"
                >
                  Back to Shop
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="bg-gray-100 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-8 text-center text-3xl font-bold">
              Related Products
            </h2>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}