import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  items: IOrderItem[];
  total: number;
  status: "pending" | "contacted" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: [0, "Price must be >= 0"] },
    quantity: { type: Number, required: true, min: [1, "Quantity must be >= 1"] },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    customerName: { type: String, required: [true, "Customer name is required"], trim: true },
    phone: { type: String, required: [true, "Phone number is required"], trim: true },
    email: { type: String, trim: true },
    address: { type: String, required: [true, "Delivery address is required"], trim: true },
    notes: { type: String, trim: true },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => Array.isArray(v) && v.length > 0,
        message: "Order must contain at least one item",
      },
    },
    total: { type: Number, required: true, min: [0, "Total must be >= 0"] },
    status: {
      type: String,
      enum: ["pending", "contacted", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = models.Order ?? mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
