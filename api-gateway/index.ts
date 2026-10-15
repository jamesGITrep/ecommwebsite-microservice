import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = 4000;

app.use(cors());

// Rate limiting for API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
});
app.use('/api', limiter);

// Microservice Routes
const services = {
  catalog: process.env.CATALOG_URL || 'http://localhost:4001',
  order: process.env.ORDER_URL || 'http://localhost:4002',
  customer: process.env.CUSTOMER_URL || 'http://localhost:4003',
  marketing: process.env.MARKETING_URL || 'http://localhost:4004',
  payment: process.env.PAYMENT_URL || 'http://localhost:4005',
};

const frontends = {
  products: process.env.FRONTEND_PRODUCTS_URL || 'http://localhost:3001',
  search: process.env.FRONTEND_SEARCH_URL || 'http://localhost:3002',
  cart: process.env.FRONTEND_CART_URL || 'http://localhost:3003',
  payment: process.env.FRONTEND_PAYMENT_URL || 'http://localhost:3004',
};

// Proxy setup
app.use('/api/catalog', createProxyMiddleware({ target: services.catalog, changeOrigin: true, pathRewrite: { '^/api/catalog': '' } }));
app.use('/api/order', createProxyMiddleware({ target: services.order, changeOrigin: true, pathRewrite: { '^/api/order': '' } }));
app.use('/api/customer', createProxyMiddleware({ target: services.customer, changeOrigin: true, pathRewrite: { '^/api/customer': '' } }));
app.use('/api/marketing', createProxyMiddleware({ target: services.marketing, changeOrigin: true, pathRewrite: { '^/api/marketing': '' } }));
app.use('/api/payment', createProxyMiddleware({ target: services.payment, changeOrigin: true, pathRewrite: { '^/api/payment': '' } }));

// Frontend Proxies (Must be registered AFTER API proxies)
app.get(/^\/(search|cart|payment)$/, (req, res) => {
  res.redirect(req.path + '/');
});

app.use('/search', createProxyMiddleware({ target: frontends.search, changeOrigin: true, pathRewrite: (path) => '/search' + path }));
app.use('/cart', createProxyMiddleware({ target: frontends.cart, changeOrigin: true, pathRewrite: (path) => '/cart' + path }));
app.use('/payment', createProxyMiddleware({ target: frontends.payment, changeOrigin: true, pathRewrite: (path) => '/payment' + path }));

// Default proxy for the products viewing app (Root route)
app.use('/', createProxyMiddleware({ target: frontends.products, changeOrigin: true }));

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
