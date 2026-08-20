import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import type { IOrderItem } from "@/models/Order";
import { sendOrderNotification } from "@/lib/email";
// POST /api/orders — public. Customers submit orders without logging in.
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { customerName, phone, email, address, notes, items } = body;

    if (typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 }
      );
    }
    if (typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }
    if (typeof address !== "string" || !address.trim()) {
      return NextResponse.json(
        { success: false, error: "Delivery address is required." },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your cart is empty." },
        { status: 400 }
      );
    }

    // Recompute the total server-side — never trust a client-supplied total.
    const cleanItems: IOrderItem[] = items.map((item) => ({
      productId: String(item.productId),
      name: String(item.name),
      price: Number(item.price),
      quantity: Math.max(1, Math.floor(Number(item.quantity))),
    }));
    const total = cleanItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

        const order = await Order.create({
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: typeof email === "string" ? email.trim() : undefined,
      address: address.trim(),
      notes: typeof notes === "string" ? notes.trim() : undefined,
      items: cleanItems,
      total,
      status: "pending",
    });

    void sendOrderNotification(order);

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to place order",
      },
      { status: 400 }
    );
  }
}

// GET /api/orders — admin-only (enforced in proxy.ts). Lists orders newest first.
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10)));

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      count: orders.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
