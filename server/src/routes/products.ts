import { Request, Response } from 'express';
import { products as allProducts } from '../data/seed.js';
import { Product, PaginatedResponse } from '../types/index.js';

interface ProductQuery {
  page?: string;
  pageSize?: string;
  search?: string;
  category?: string;
  stockStatus?: string;
  sortBy?: string;
  sortOrder?: string;
}

export function getProducts(req: Request, res: Response): void {
  const { page = '1', pageSize = '25', search, category, stockStatus, sortBy = 'name', sortOrder = 'asc' } = req.query as ProductQuery;
  
  let filtered = [...allProducts];

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchLower));
  }

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  if (stockStatus) {
    const statuses = stockStatus.split(',');
    filtered = filtered.filter(p => statuses.includes(p.stockStatus));
  }

  const sortFn = (a: Product, b: Product) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'stockStatus':
        const stockOrder = { in_stock: 0, low_stock: 1, out_of_stock: 2 };
        comparison = stockOrder[a.stockStatus] - stockOrder[b.stockStatus];
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  };

  filtered.sort(sortFn);

  const pageNum = parseInt(page);
  const size = parseInt(pageSize);
  const start = (pageNum - 1) * size;
  const end = start + size;

  const paginatedData: PaginatedResponse<Product> = {
    data: filtered.slice(start, end),
    total: filtered.length,
    page: pageNum,
    pageSize: size,
    totalPages: Math.ceil(filtered.length / size)
  };

  res.json(paginatedData);
}

export function getProductById(req: Request, res: Response): void {
  const { id } = req.params;
  const product = allProducts.find(p => p.id === id);
  
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  
  res.json(product);
}

export function updateProduct(req: Request, res: Response): void {
  const { id } = req.params;
  const productIndex = allProducts.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const { price, stockStatus } = req.body;
  
  if (price !== undefined) {
    allProducts[productIndex].price = price;
  }
  
  if (stockStatus !== undefined) {
    allProducts[productIndex].stockStatus = stockStatus;
  }

  res.json(allProducts[productIndex]);
}

interface BulkUpdateBody {
  ids: string[];
  isActive: boolean;
}

export function bulkUpdateProducts(req: Request, res: Response): void {
  const { ids, isActive } = req.body as BulkUpdateBody;
  
  if (!Array.isArray(ids)) {
    res.status(400).json({ error: 'ids must be an array' });
    return;
  }

  let updatedCount = 0;
  
  for (const id of ids) {
    const productIndex = allProducts.findIndex(p => p.id === id);
    if (productIndex !== -1) {
      allProducts[productIndex].isActive = isActive;
      updatedCount++;
    }
  }

  res.json({ updated: updatedCount });
}