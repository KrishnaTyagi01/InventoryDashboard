import express from 'express';
import cors from 'cors';
import { getProducts, getProductById, updateProduct, bulkUpdateProducts } from './routes/products.js';
import { getOrders, getOrderById } from './routes/orders.js';
import { getAnalytics, getCategoryAnalytics } from './routes/analytics.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/products', getProducts);
app.get('/api/products/:id', getProductById);
app.put('/api/products/:id', updateProduct);
app.put('/api/products/bulk', bulkUpdateProducts);

app.get('/api/orders/:id', getOrderById);
app.get('/api/orders', getOrders);

app.get('/api/analytics', getAnalytics);
app.get('/api/analytics/categories', getCategoryAnalytics);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});