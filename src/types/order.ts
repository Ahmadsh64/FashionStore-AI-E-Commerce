import type { PaymentMethod } from "@/lib/validators";

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  created_at: string;
  order_items?: OrderItem[];
};
