export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

export interface OrderByDay {
  date: string;
  count: number;
  revenue: number;
}

export interface RevenueByCategory {
  category: string;
  revenue: number;
}

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topCategory: string;
  ordersByDay: OrderByDay[];
  revenueByCategory: RevenueByCategory[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}