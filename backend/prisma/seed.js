const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@db:5432/campusly?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  'Engineering',
  'Business',
  'Medicine',
  'Law',
  'Computer Science',
  'Mathematics',
  'Arts & Humanities',
  'Natural Sciences',
];

const PRODUCT_TYPES = [
  { value: 'module', label: 'Modules' },
  { value: 'notes', label: 'Lecture Notes' },
  { value: 'past-exam', label: 'Past Exam Papers' },
  { value: 'video-lecture', label: 'Video Lectures' },
];

async function main() {
  console.log('🌱 Start seeding...');

  for (const catName of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
    console.log(`Created/found category: ${category.name}`);

    for (const pt of PRODUCT_TYPES) {
      await prisma.productType.upsert({
        where: {
          category_id_name: {
            category_id: category.id,
            name: pt.value,
          },
        },
        update: {},
        create: {
          category_id: category.id,
          name: pt.value,
        },
      });
    }
    console.log(`  Added product types for ${category.name}`);
  }

  console.log('✅ Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
