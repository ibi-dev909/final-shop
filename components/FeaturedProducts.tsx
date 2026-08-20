import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function FeaturedProducts() {
  await dbConnect();

  const docs = await Product.find({ featured: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const products = docs.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    category: p.category,
    images: p.images,
    stock: p.stock,
    featured: p.featured,
    sku: p.sku,
  }));

  if (products.length === 0) {
    return (
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold">Featured Products</h2>
            <p className="mt-4 text-gray-500">
              Discover our most popular products.
            </p>
          </div>

          <p className="text-center text-gray-400">
            No featured products yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold">Featured Products</h2>

          <p className="mt-4 text-gray-500">
            Discover our most popular products.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => {
            const image =
              product.images[0] ??
              "https://placehold.co/600x600?text=No+Image";

            return (
              <Link
                key={product._id}
                href={`/product/${product._id}`}
                className="overflow-hidden rounded-2xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    unoptimized={image.startsWith("data:")}
                    className="object-cover"
                  />
                </div>

                <div className="p-6">
                  <span className="text-sm text-blue-600">
                    {product.category}
                  </span>

                  <h3 className="mt-2 text-xl font-bold">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Rs. {product.price.toLocaleString()}
                  </p>

                  <span className="mt-6 block w-full rounded-xl bg-slate-900 py-3 text-center font-semibold text-white transition hover:bg-slate-800">
                    View Product
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}