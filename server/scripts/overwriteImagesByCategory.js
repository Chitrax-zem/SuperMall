require('dotenv').config();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../src/config/env');

const Product = require('../src/models/Product');
const Shop = require('../src/models/Shop');
const Category = require('../src/models/Category');

// Helper to format Unsplash images
const img = (u) => `${u}?auto=format&fit=crop&w=1200&q=80`;

// 🎯 Category-based image pools
// 🎯 Category-based image pools
const curated = {
  Groceries: [
    img('https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38'),
    img('https://images.unsplash.com/photo-1560807707-8cc77767d783'),
    img('https://images.unsplash.com/photo-1542838132-92c53300491e'),
    img('https://images.unsplash.com/photo-1504754524776-8f4f37790ca0'),
  ],
  Electronics: [
    img('https://images.unsplash.com/photo-1518779578993-ec3579fee39f'),
    img('https://images.unsplash.com/photo-1517336714731-489689fd1ca8'),
    img('https://images.unsplash.com/photo-1555617117-08dd1f4848df'),
    img('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'),
  ],
  Clothing: [
    img('https://images.unsplash.com/photo-1520975693416-35a6c67e52a0'),
    img('https://images.unsplash.com/photo-1523381294911-8d3cead13475'),
    img('https://images.unsplash.com/photo-1512436991641-6745cdb1723f'),
    img('https://images.unsplash.com/photo-1520975661595-6453be3f7070'),
  ],
  Handicrafts: [
    img('https://images.unsplash.com/photo-1519710164239-da123dc03ef4'),
    img('https://images.unsplash.com/photo-1523419409543-a7f78af5f3c4'),
    img('https://images.unsplash.com/photo-1503602642458-232111445657'),
    img('https://images.unsplash.com/photo-1472908163257-60b6c701fd55'),
  ],
  Bakery: [
    img('https://images.unsplash.com/photo-1514996937319-344454492b37'),
    img('https://images.unsplash.com/photo-1541167760496-1628856ab772'),
    img('https://images.unsplash.com/photo-1542838132-92c53300491e'),
    img('https://images.unsplash.com/photo-1486427944299-d1955d23e34d'),
  ],
  Beauty: [
    img('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9'),
    img('https://images.unsplash.com/photo-1535639818669-74f6c4f9a448'),
    img('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2'),
    img('https://images.unsplash.com/photo-1542834369-f10ebf06d3cb'),
  ],
};


// 🔀 Pick random unique images
function pickUniqueImages(pool, min = 1, max = 3) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, pool.length));
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('🔄 Overwriting images with unique category-based images...');

  // Load categories
  const categories = await Category.find({}).lean();
  const catById = Object.fromEntries(
    categories.map((c) => [String(c._id), c.name])
  );

  // 🛒 PRODUCTS
  const products = await Product.find({})
    .select('_id category images')
    .lean();

  let productsUpdated = 0;

  for (const product of products) {
    const categoryName = catById[String(product.category)] || 'Groceries';
    const pool = curated[categoryName] || curated.Groceries;

    const images = pickUniqueImages(pool, 1, 3);

    await Product.updateOne(
      { _id: product._id },
      { $set: { images } }
    );

    productsUpdated++;
  }

  // 🏪 SHOPS
  const shops = await Shop.find({})
    .select('_id categories images')
    .lean();

  let shopsUpdated = 0;

  for (const shop of shops) {
    const firstCategoryId =
      Array.isArray(shop.categories) && shop.categories.length > 0
        ? String(shop.categories[0])
        : null;

    const categoryName = catById[firstCategoryId] || 'Groceries';
    const pool = curated[categoryName] || curated.Groceries;

    const images = pickUniqueImages(pool, 2, 4);

    await Shop.updateOne(
      { _id: shop._id },
      { $set: { images } }
    );

    shopsUpdated++;
  }

  console.log(`✅ Products updated: ${productsUpdated}`);
  console.log(`✅ Shops updated: ${shopsUpdated}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Image overwrite failed:', err);
  process.exit(1);
});
