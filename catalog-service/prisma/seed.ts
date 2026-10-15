import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = `${process.env.DATABASE_URL || 'postgresql://postgres:james@localhost:5432/catalog_db?schema=public'}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`Database already has ${count} products, skipping seed.`);
    return;
  }

  const electronics = await prisma.category.create({
    data: { name: 'Electronics', slug: 'electronics' },
  });
  const audio = await prisma.category.create({
    data: { name: 'Audio', slug: 'audio' },
  });
  const wearables = await prisma.category.create({
    data: { name: 'Wearables', slug: 'wearables' },
  });

  const productsData = [
    {
      title: 'Titanium Pro Smartphone 15',
      description: 'Super Retina XDR OLED display, A17 Pro chip, 48MP camera system.',
      basePrice: 1199.99,
      categoryId: electronics.id,
      media: 'https://images.unsplash.com/photo-1511707171634-5f897ff025a0?w=600&auto=format&fit=crop&q=80',
      sku: 'TITAN-15-256',
      stock: 45
    },
    {
      title: 'Aura ANC Wireless Headphones',
      description: 'Industry-leading noise cancellation, 40-hour battery life and spatial audio.',
      basePrice: 349.99,
      categoryId: audio.id,
      media: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      sku: 'AURA-ANC-BLK',
      stock: 60
    },
    {
      title: 'NovaBlade Ultra Laptop 16"',
      description: 'Ultra-thin carbon chassis, M-Series performance, Liquid Retina display.',
      basePrice: 1899.99,
      categoryId: electronics.id,
      media: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
      sku: 'NOVA-16-1TB',
      stock: 25
    },
    {
      title: 'Apex Fit AMOLED Smartwatch',
      description: 'Advanced biometric sensors, titanium bezel, sapphire crystal glass and 14-day battery.',
      basePrice: 279.99,
      categoryId: wearables.id,
      media: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      sku: 'APEX-FIT-SILVER',
      stock: 80
    },
    {
      title: 'Lumix Alpha Cinema 4K Camera',
      description: 'Full-frame sensor with 6K oversampling, optical image stabilization and dual native ISO.',
      basePrice: 1499.99,
      categoryId: electronics.id,
      media: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
      sku: 'LUMIX-4K-BODY',
      stock: 15
    },
    {
      title: 'SonicPulse Hi-Res Bluetooth Speaker',
      description: '360-degree immersive sound, IP67 waterproof with dual passive radiators.',
      basePrice: 159.99,
      categoryId: audio.id,
      media: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80',
      sku: 'SONIC-PULSE-GRY',
      stock: 90
    }
  ];

  for (const p of productsData) {
    await prisma.product.create({
      data: {
        title: p.title,
        description: p.description,
        basePrice: p.basePrice,
        categoryId: p.categoryId,
        variants: {
          create: [
            { sku: p.sku, price: p.basePrice, stock: p.stock, attributes: { edition: 'Standard' } }
          ]
        },
        media: {
          create: [
            { url: p.media, altText: p.title, isPrimary: true }
          ]
        }
      }
    });
  }

  console.log(`Seeded Catalog Database with 3 categories and ${productsData.length} premium products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
