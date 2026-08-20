export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "pending" | "contacted" | "completed" | "cancelled";

export interface Order {
  _id: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}
