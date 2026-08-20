import Link from "next/link";
import Image from "next/image";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";

export default async function Categories() {
  await dbConnect();

  const docs = await Category.find().sort({ createdAt: -1 }).lean();

  const categories = docs.map((c) => ({
    _id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
  }));

  if (categories.length === 0) {
    return (
      <section id="categories" className="bg-gray-100 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-3 text-center text-4xl font-bold">
            Shop by Category
          </h2>

          <p className="mb-12 text-center text-gray-500">
            Find everything you need in one place.
          </p>

          <p className="text-center text-gray-400">
            No categories yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="bg-gray-100 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-3 text-center text-4xl font-bold">
          Shop by Category
        </h2>

        <p className="mb-12 text-center text-gray-500">
          Find everything you need in one place.
        </p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const image =
              category.image ||
              "https://placehold.co/600x400?text=No+Image";

            return (
              <Link
                key={category._id}
                href={`/shop?category=${encodeURIComponent(category.name)}`}
                className="overflow-hidden rounded-2xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-56 w-full">
                  <Image
                    src={image}
                    alt={category.name}
                    fill
                    unoptimized={image.startsWith("data:")}
                    className="object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold">
                    {category.name}
                  </h3>

                  <span className="mt-6 block w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700">
                    Explore
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