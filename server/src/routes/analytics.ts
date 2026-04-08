import { Request, Response } from 'express';
import { orders, products } from '../data/seed.js';
import { Analytics, OrderByDay, RevenueByCategory } from '../types/index.js';

export function getAnalytics(req: Request, res: Response): void {
  const { startDate, endDate } = req.query;
  
  let filteredOrders = [...orders];
  
  if (startDate) {
    filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) >= new Date(startDate as string));
  }
  
  if (endDate) {
    filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) <= new Date(endDate as string));
  }

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const ordersByDayMap = new Map<string, { count: number; revenue: number }>();
  
  for (const order of filteredOrders) {
    const date = order.createdAt.split('T')[0];
    const existing = ordersByDayMap.get(date) || { count: 0, revenue: 0 };
    ordersByDayMap.set(date, {
      count: existing.count + 1,
      revenue: existing.revenue + order.total
    });
  }

  const ordersByDay: OrderByDay[] = Array.from(ordersByDayMap.entries())
    .map(([date, data]) => ({ date, count: data.count, revenue: Math.round(data.revenue * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const categoryRevenueMap = new Map<string, number>();
  
  for (const order of filteredOrders) {
    for (const item of order.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const current = categoryRevenueMap.get(product.category) || 0;
        categoryRevenueMap.set(product.category, current + item.price * item.quantity);
      }
    }
  }

  const revenueByCategory: RevenueByCategory[] = Array.from(categoryRevenueMap.entries())
    .map(([category, revenue]) => ({ category, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue);

  let topCategory = 'N/A';
  if (revenueByCategory.length > 0) {
    topCategory = revenueByCategory[0].category;
  }

  const analytics: Analytics = {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    topCategory,
    ordersByDay,
    revenueByCategory
  };

  res.json(analytics);
}

export function getCategoryAnalytics(req: Request, res: Response): void {
  const { startDate, endDate } = req.query;
  
  let filteredOrders = [...orders];
  
  if (startDate) {
    filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) >= new Date(startDate as string));
  }
  
  if (endDate) {
    filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) <= new Date(endDate as string));
  }

  const categoryRevenueMap = new Map<string, number>();
  
  for (const order of filteredOrders) {
    for (const item of order.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const current = categoryRevenueMap.get(product.category) || 0;
        categoryRevenueMap.set(product.category, current + item.price * item.quantity);
      }
    }
  }

  const revenueByCategory: RevenueByCategory[] = Array.from(categoryRevenueMap.entries())
    .map(([category, revenue]) => ({ category, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue);

  res.json(revenueByCategory);
}