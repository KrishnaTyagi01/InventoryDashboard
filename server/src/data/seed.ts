import { Product, Order, OrderItem } from '../types/index.js';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Toys & Games',
  'Health & Beauty',
  'Food & Beverages',
  'Automotive',
  'Office Supplies'
];

const FIRST_NAMES = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'Tom', 'Anna'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Wilson'];

const PRODUCT_PREFIXES = ['Premium', 'Classic', 'Modern', 'Pro', 'Ultra', 'Elite', 'Basic', 'Advanced', 'Essential', 'Deluxe'];
const PRODUCT_NOUNS = ['Widget', 'Gadget', 'Device', 'Tool', 'Kit', 'Set', 'Pack', 'Bundle', 'Collection', 'System'];

function randomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProductName(): string {
  const prefix = randomElement(PRODUCT_PREFIXES);
  const noun = randomElement(PRODUCT_NOUNS);
  const variant = randomBetween(1, 100);
  return `${prefix} ${noun} ${variant}`;
}

function determineStockStatus(stock: number): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (stock === 0) return 'out_of_stock';
  if (stock <= 10) return 'low_stock';
  return 'in_stock';
}

export function generateProducts(count: number = 500): Product[] {
  const products: Product[] = [];

  for (let i = 0; i < count; i++) {
    const category = randomElement(CATEGORIES);
    const price = randomBetween(10, 500) + Math.random();
    const stock = randomBetween(0, 100);
    
    const daysAgo = randomBetween(0, 90);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    products.push({
      id: `prod_${randomId()}`,
      name: generateProductName(),
      category,
      price: Math.round(price * 100) / 100,
      stockStatus: determineStockStatus(stock),
      isActive: Math.random() > 0.1,
      createdAt
    });
  }

  return products;
}

export function generateOrders(products: Product[], count: number = 1000): Order[] {
  const orders: Order[] = [];
  const statuses: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered'];
  
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const numItems = randomBetween(1, 5);
    const items: OrderItem[] = [];
    let total = 0;

    for (let j = 0; j < numItems; j++) {
      const product = randomElement(products.filter(p => p.isActive));
      const quantity = randomBetween(1, 3);
      const itemPrice = product.price;
      
      items.push({
        productId: product.id,
        name: product.name,
        quantity,
        price: itemPrice
      });
      
      total += itemPrice * quantity;
    }

    const createdAtTimestamp = randomBetween(thirtyDaysAgo, now);
    const createdAt = new Date(createdAtTimestamp).toISOString();
    
    orders.push({
      id: `ord_${randomId()}`,
      customerName: `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`,
      items,
      total: Math.round(total * 100) / 100,
      status: randomElement(statuses),
      createdAt
    });
  }

  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const products = generateProducts(500);
export const orders = generateOrders(products, 1000);