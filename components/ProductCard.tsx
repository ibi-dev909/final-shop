"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const image =
    product.images[0] ?? "https://placehold.co/600x600?text=No+Image";
  const outOfStock = product.stock <= 0;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <Link href={`/product/${product._id}`}>
        <div className="relative h-64 w-full bg-gray-100">
          <Image
            src={image}
            alt={product.name}
            fill
            unoptimized={image.startsWith("data:")}
            className="object-cover"
          />
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/product/${product._id}`}>
          <span className="text-sm font-medium text-blue-600">
            {product.category}
          </span>

          <h3 className="mt-2 text-xl font-bold hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {product.description}
        </p>

        <p className="mt-2 text-lg font-bold text-slate-900">
          Rs. {product.price.toLocaleString()}
        </p>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/product/${product._id}`}
            className="flex-1 rounded-lg border border-slate-900 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            View
          </Link>

          <button
            onClick={() => addItem(product, 1)}
            disabled={outOfStock}
            className="flex-1 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}