import { Request, Response } from 'express';
import { orders as allOrders } from '../data/seed.js';
import { Order, PaginatedResponse } from '../types/index.js';

interface OrderQuery {
  page?: string;
  pageSize?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export function getOrders(req: Request, res: Response): void {
  const { page = '1', pageSize = '25', status, startDate, endDate } = req.query as OrderQuery;
  
  let filtered = [...allOrders];

  if (status) {
    const statuses = status.split(',');
    filtered = filtered.filter(o => statuses.includes(o.status));
  }

  if (startDate) {
    filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(startDate));
  }

  if (endDate) {
    filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(endDate));
  }

  const pageNum = parseInt(page);
  const size = parseInt(pageSize);
  const start = (pageNum - 1) * size;
  const end = start + size;

  const paginatedData: PaginatedResponse<Order> = {
    data: filtered.slice(start, end),
    total: filtered.length,
    page: pageNum,
    pageSize: size,
    totalPages: Math.ceil(filtered.length / size)
  };

  res.json(paginatedData);
}

export function getOrderById(req: Request, res: Response): void {
  const { id } = req.params;
  const order = allOrders.find(o => o.id === id);
  
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  
  res.json(order);
}