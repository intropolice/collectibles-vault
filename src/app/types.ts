export interface CollectibleItem {
  id: number;
  name: string;
  category: string;
  value: number;
  condition: string;
  year: number;
  image: string;
  description: string;
  acquired: string;
  userId: string; // Owner of the item
  userName?: string; // Name of the item creator
}

export type Category = {
  id: string;
  name: string;
  icon: string;
};

export interface User {
  id: number | string;
  email: string;
  username?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  created_at?: string;
  createdAt?: string;
  bio?: string;
  token?: string;
  total_collections?: number;
  total_items?: number;
  total_collection_value?: number;
}