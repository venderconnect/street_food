// backend/src/scripts/seed.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'streetfood-connect' });

  let supplier = await User.findOne({ email: 'seed@example.com' });
  if (!supplier) {
    const passwordHash = await bcrypt.hash('secret', 10);
    supplier = await User.create({
      name: 'Seed Supplier',
      email: 'seed@example.com',
      passwordHash,
      role: 'supplier',
    });
  }

  const products = [
    { supplier: supplier._id, name: 'Tomatoes (10kg)', description: 'Fresh farm tomatoes', price: 450, unit: '10kg', isPrepped: false },
    { supplier: supplier._id, name: 'Onions (10kg)', description: 'Kitchen staple', price: 520, unit: '10kg', isPrepped: false },
    { supplier: supplier._id, name: 'Idli Batter (5kg)', description: 'Fermented rice batter', price: 550, unit: '5kg', isPrepped: true },
    { supplier: supplier._id, name: 'Coconut Chutney (2kg)', description: 'Ready-to-serve', price: 380, unit: '2kg', isPrepped: true },
  ];

  await Product.insertMany(products, { ordered: true });
  console.log('Seeded products:', products.length);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
