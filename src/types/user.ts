export type UserRole = "customer" | "admin";

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
};
