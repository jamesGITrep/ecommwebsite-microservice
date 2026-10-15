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

const PORT = 4004;

app.get('/reviews/:productId', async (req, res) => {
  try {
    const productId = z.string().uuid().parse(req.params.productId);
    const reviews = await prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/discounts/validate', async (req, res) => {
  try {
    const code = z.string().min(1).parse(req.body.code);
    const discount = await prisma.discountCoupon.findUnique({
      where: { code },
    });
    if (!discount || !discount.isActive) {
      return res.status(404).json({ error: 'Invalid or expired coupon code' });
    }
    res.json(discount);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Marketing Service listening on port ${PORT}`);
});
