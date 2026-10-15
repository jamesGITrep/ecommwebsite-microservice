import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import axios from 'axios';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4002;

const cartItemSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  variantId: z.string().min(1, 'variantId is required'),
  quantity: z.number().int().positive(),
});

app.post('/cart', async (req, res) => {
  try {
    const { userId, sessionId, variantId, quantity } = cartItemSchema.parse(req.body);
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'Must provide userId or sessionId' });
    }

    // Find or create cart
    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, sessionId },
      });
    }

    // Add item
    const item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId,
        quantity,
      }
    });

    res.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/cart/:id', async (req, res) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const cart = await prisma.cart.findUnique({
      where: { id },
      include: { items: true },
    });
    res.json(cart);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

const checkoutSchema = z.object({
  cartId: z.string().uuid(),
  userId: z.string().optional(),
  shippingAddress: z.any()
});

app.post('/checkout', async (req, res) => {
  try {
    const { cartId, userId, shippingAddress } = checkoutSchema.parse(req.body);

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or not found' });
    }

    const itemsForDeduction = cart.items.map(item => ({
      variantId: item.variantId,
      quantity: item.quantity
    }));

    // SAGA STEP 1: Deduct Inventory
    let inventoryResponse;
    const catalogUrl = process.env.CATALOG_URL || 'http://localhost:4001';
    try {
      inventoryResponse = await axios.post(`${catalogUrl}/inventory/deduct`, { items: itemsForDeduction });
    } catch (error: any) {
      console.error('Inventory deduction failed', error.response?.data || error.message);
      return res.status(400).json({ error: 'Inventory deduction failed: ' + (error.response?.data?.error || error.message) });
    }

    const { totalAmount, processedItems } = inventoryResponse.data;

    // SAGA STEP 2: Create Order (Status: PENDING)
    const order = await prisma.order.create({
      data: {
        userId: userId || cart.userId || undefined,
        status: 'PENDING',
        total: totalAmount,
        shippingAddress: shippingAddress || {},
        tax: totalAmount * 0.1, // mock 10% tax
        shippingCost: 5.0, // mock shipping cost
        items: {
          create: processedItems.map((pi: any) => ({
            variantId: pi.variantId,
            quantity: pi.quantity,
            price: pi.price
          }))
        }
      }
    });

    // SAGA STEP 3: Process Payment
    const paymentUrl = process.env.PAYMENT_URL || 'http://localhost:4005';
    try {
      await axios.post(`${paymentUrl}/process`, {
        orderId: order.id,
        amount: order.total + order.tax + order.shippingCost
      });
      
      // Update order to PAID
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' }
      });
      
      // Clear the cart
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await prisma.cart.delete({ where: { id: cart.id } });

      return res.json({ success: true, orderId: order.id });
    } catch (paymentError: any) {
      console.error('Payment failed, rolling back inventory', paymentError.response?.data || paymentError.message);
      
      // COMPENSATING ACTION: Restore Inventory
      try {
        await axios.post(`${catalogUrl}/inventory/restore`, { items: itemsForDeduction });
      } catch (restoreError) {
        console.error('CRITICAL: Failed to restore inventory after payment failure', restoreError);
      }

      // Mark order as FAILED
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED_PAYMENT' }
      });

      return res.status(400).json({ error: 'Payment failed. Order not completed and inventory restored.' });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Order Service listening on port ${PORT}`);
});
