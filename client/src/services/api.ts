import { Product, Order, Analytics, PaginatedResponse, RevenueByCategory } from '../types';

const API_BASE = '/api';

export interface ProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  stockStatus?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface OrdersParams {
  page?: number;
  pageSize?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
}

function buildQueryString(params: ProductsParams | OrdersParams | AnalyticsParams): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  return searchParams.toString();
}

export async function getProducts(params: ProductsParams): Promise<PaginatedResponse<Product>> {
  const query = buildQueryString(params);
  const response = await fetch(`${API_BASE}/products?${query}`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}

export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE}/products/${id}`);
  if (!response.ok) throw new Error('Failed to fetch product');
  return response.json();
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
}

export async function bulkUpdateProducts(ids: string[], isActive: boolean): Promise<{ updated: number }> {
  const response = await fetch(`${API_BASE}/products/bulk`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, isActive }),
  });
  if (!response.ok) throw new Error('Failed to bulk update products');
  return response.json();
}

export async function getOrders(params: OrdersParams): Promise<PaginatedResponse<Order>> {
  const query = buildQueryString(params);
  const response = await fetch(`${API_BASE}/orders?${query}`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

export async function getOrderById(id: string): Promise<Order> {
  const response = await fetch(`${API_BASE}/orders/${id}`);
  if (!response.ok) throw new Error('Failed to fetch order');
  return response.json();
}

export async function getAnalytics(params: AnalyticsParams): Promise<Analytics> {
  const query = buildQueryString(params);
  const response = await fetch(`${API_BASE}/analytics?${query}`);
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

export async function getCategoryAnalytics(params: AnalyticsParams): Promise<RevenueByCategory[]> {
  const query = buildQueryString(params);
  const response = await fetch(`${API_BASE}/analytics/categories?${query}`);
  if (!response.ok) throw new Error('Failed to fetch category analytics');
  return response.json();
}