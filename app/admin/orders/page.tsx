"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import type { Order, OrderStatus } from "@/types/order";

interface OrdersResponse {
  success: boolean;
  error?: string;
  total: number;
  data: Order[];
}

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-200 text-gray-600",
};

export default function OrdersManagement() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const json: OrdersResponse = await res.json();

      if (!json.success) {
        setError(json.error ?? "Failed to load orders");
        return;
      }
      setOrders(json.data);
      setTotal(json.total);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const id = setTimeout(() => fetchOrders(), 0);
    return () => clearTimeout(id);
  }, [fetchOrders]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Failed to update order");
        return;
      }
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? { ...order, status } : order))
      );
    } catch {
      setError("Failed to update order");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
            <p className="mt-1 text-sm text-gray-500">{total} orders total</p>
          </div>
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

        <div className="mb-6 flex gap-2">
          {["", "pending", "contacted", "completed", "cancelled"].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                statusFilter === s
                  ? "bg-slate-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-12 text-center text-gray-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="py-12 text-center text-gray-400">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const expanded = expandedId === order._id;
              return (
                <div key={order._id} className="rounded-xl bg-white shadow-sm">
                  <button
                    onClick={() => setExpandedId(expanded ? null : order._id)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {order.customerName}{" "}
                        <span className="font-normal text-gray-400">
                          &middot; {order.phone}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()} &middot;{" "}
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-slate-900">
                        Rs. {order.total.toLocaleString()}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Contact</p>
                          <p className="text-sm text-gray-600">{order.phone}</p>
                          {order.email && (
                            <p className="text-sm text-gray-600">{order.email}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Delivery Address</p>
                          <p className="text-sm text-gray-600">{order.address}</p>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-slate-900">Notes</p>
                          <p className="text-sm text-gray-600">{order.notes}</p>
                        </div>
                      )}

                      <div className="mt-4">
                        <p className="mb-2 text-sm font-semibold text-slate-900">Items</p>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm text-gray-600">
                              <span>
                                {item.name} &times; {item.quantity}
                              </span>
                              <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          Update status:
                        </span>
                        {(["pending", "contacted", "completed", "cancelled"] as OrderStatus[]).map(
                          (s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order._id, s)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                                order.status === s
                                  ? statusStyles[s]
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              {s}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
