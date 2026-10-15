import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4005;

const processPaymentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
});

app.post('/process', async (req, res) => {
  try {
    const { orderId, amount } = processPaymentSchema.parse(req.body);

    // Mock payment processing logic
    // We will assume it's successful if amount > 0
    const isSuccess = amount > 0;

    if (!isSuccess) {
      return res.status(400).json({ error: 'Payment failed' });
    }

    // Record the transaction
    const transaction = await prisma.transaction.create({
      data: {
        orderId,
        amount,
        status: 'SUCCESS',
      },
    });

    res.json({ success: true, transaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    // Handle unique constraint violations (e.g., payment already processed)
    if ((error as any).code === 'P2002') {
      return res.status(409).json({ error: 'Payment already processed for this order' });
    }
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Payment Service listening on port ${PORT}`);
});
