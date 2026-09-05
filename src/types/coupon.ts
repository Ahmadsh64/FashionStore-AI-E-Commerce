export type { Coupon, CouponResult } from "@/lib/coupons";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  published: boolean;
  created_at: string;
};
