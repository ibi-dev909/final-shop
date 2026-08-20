"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          email: email || undefined,
          address,
          notes: notes || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? "Could not place order.");
        return;
      }

      clearCart();
      setPlaced(true);
    } catch {
      setError("Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <>
        <Navbar />
        <section className="bg-white py-24">
          <div className="mx-auto max-w-xl px-6 text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Order received!
            </h1>
            <p className="mt-4 text-gray-600">
              Thanks — we&apos;ve got your order and will contact you shortly
              to confirm details and arrange payment and delivery.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <section className="bg-white py-24">
          <div className="mx-auto max-w-xl px-6 text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Your cart is empty
            </h1>
            <Link
              href="/shop"
              className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="bg-white py-12">
        <div className="mx-auto max-w-5xl px-6">

          <h1 className="mb-8 text-3xl font-bold text-slate-900">
            Your Cart
          </h1>

          <div className="grid gap-10 lg:grid-cols-3">

            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 p-4"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized={item.image.startsWith("data:")}
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Rs. {item.price.toLocaleString()} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="h-8 w-8 rounded-lg border border-gray-300 font-bold hover:bg-gray-100"
                    >
                      -
                    </button>

                    <span className="w-6 text-center">{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="h-8 w-8 rounded-lg border border-gray-300 font-bold hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <p className="w-24 text-right font-semibold text-slate-900">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-slate-900">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Order form */}
            <div>
              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border border-gray-200 p-6"
              >
                <h2 className="text-xl font-bold text-slate-900">
                  Your Details
                </h2>

                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Email <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Delivery Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Notes <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>

                <p className="text-xs text-gray-400">
                  We&apos;ll contact you to confirm your order and arrange
                  payment and delivery.
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}