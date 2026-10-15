import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

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

const PORT = 4001;

// Zod schemas for validation
const idSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Get all active products
app.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { variants: true, media: true, category: true },
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by ID (Strict Zod validation)
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = idSchema.parse(req.params);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, media: true, category: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get category by slug
app.get('/categories/:slug', async (req, res) => {
  try {
    // Slug validation (just non-empty string)
    const slug = z.string().min(1).parse(req.params.slug);
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { products: { include: { media: true, variants: true } } },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

const inventorySchema = z.object({
  items: z.array(z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().positive()
  }))
});

// Deduct inventory
app.post('/inventory/deduct', async (req, res) => {
  try {
    const { items } = inventorySchema.parse(req.body);
    
    // We use a transaction to ensure all or nothing
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const processedItems = [];

      for (const item of items) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (!variant || variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for variant ${item.variantId}`);
        }
        
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: variant.stock - item.quantity }
        });

        const itemTotal = variant.price * item.quantity;
        totalAmount += itemTotal;
        processedItems.push({
          variantId: variant.id,
          price: variant.price,
          quantity: item.quantity
        });
      }
      return { totalAmount, processedItems };
    });

    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    return res.status(400).json({ error: error.message });
  }
});

// Restore inventory (Compensating transaction)
app.post('/inventory/restore', async (req, res) => {
  try {
    const { items } = inventorySchema.parse(req.body);
    
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } }
        });
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    return res.status(500).json({ error: 'Failed to restore inventory' });
  }
});

app.listen(PORT, () => {
  console.log(`Catalog Service listening on port ${PORT}`);
});
