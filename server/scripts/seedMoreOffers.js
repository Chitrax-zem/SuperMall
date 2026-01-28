require('dotenv').config();
const mongoose = require('mongoose');

const { MONGODB_URI } = require('../src/config/env');
const Shop = require('../src/models/Shop');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const Offer = require('../src/models/Offer');

const MODE = (process.argv[2] || '').trim();
const IS_OPTION_1 = MODE === '1';

const OFFERS_PER_SHOP = IS_OPTION_1 ? 16 : 8;       // how many offers per shop
const MAX_PRODUCTS_PER_OFFER = IS_OPTION_1 ? 12 : 6;
const MAX_CATEGORIES_PER_OFFER = 2;

const now = new Date();
const day = 24 * 60 * 60 * 1000;

const img = (u) => `${u}?auto=format&fit=crop&w=1200&q=80`;
const bannerImages = [
  img('https://images.unsplash.com/photo-1543163521-1bf539c55dd2'),
  img('https://images.unsplash.com/photo-1512295767273-ac109ac3acfa'),
  img('https://images.unsplash.com/photo-1512436991641-6745cdb1723f'),
  img('https://images.unsplash.com/photo-1515165562835-c3b8cce480c0'),
  img('https://images.unsplash.com/photo-1503602642458-232111445657'),
  img('https://images.unsplash.com/photo-1542834369-f10ebf06d3cb'),
  img('https://images.unsplash.com/photo-1511735111819-9a3f7709049c'),
  img('https://images.unsplash.com/photo-1512436990989-3c5b71ced2c4'),
];


const offerTitles = [
  'Festival Savings',
  'Weekend Bonanza',
  'Clearance Carnival',
  'Seasonal Special',
  'Hot Deal Spotlight',
  'Buy One Get One',
  'Flash Sale',
  'Value Days',
  'Super Saver',
  'Mega Markdown',
  'Bundle Boost',
  'Category Spotlight',
];

const descriptions = [
  'Grab the best deals before they’re gone!',
  'Limited-time offers on top picks.',
  'Save big on local favorites this week.',
  'Exclusive discounts for savvy shoppers.',
  'Fresh deals on curated products and categories.',
  'Don’t miss today’s special prices.',
  'A perfect time to stock up and save.',
  'Celebrate with extra savings across the store.',
];

const discountTypes = ['percentage', 'fixed', 'buy_one_get_one'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sample(arr, n) {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res.slice(0, Math.max(0, Math.min(n, res.length)));
}
function oneOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected for seeding (offers)');

    const shops = await Shop.find({ isActive: true }).lean();
    if (!shops.length) {
      console.log('No shops found. Seed products/shops first.');
      process.exit(0);
    }

    const categories = await Category.find({ isActive: true }).lean();

    let totalCreated = 0;

    for (const shop of shops) {
      // Load products for this shop
      const products = await Product.find({ isActive: true, shop: shop._id }).lean();
      if (!products.length) {
        console.log(`No products for shop "${shop.name}", skipping offers.`);
        continue;
      }

      // Choose this shop's categories or fallback to global list
      const shopCategoryIds = (shop.categories || []).map(String);
      const shopCats = shopCategoryIds.length
        ? categories.filter((c) => shopCategoryIds.includes(String(c._id)))
        : categories;

      for (let i = 0; i < OFFERS_PER_SHOP; i++) {
        const titleBase = oneOf(offerTitles);
        const title = `${titleBase} - ${shop.name} #${i + 1}`;
        const description = oneOf(descriptions);
        const image = oneOf(bannerImages);

        const roll = Math.random(); // 0..1
        let validFrom, validUntil;
        // ~70% active, ~15% upcoming, ~15% expired
        if (roll < 0.7) {
          // Active: started in last 0-3 days, lasts 5-14 days
          const startOffset = -randInt(0, 3);
          const lengthDays = randInt(5, 14);
          validFrom = new Date(now.getTime() + startOffset * day);
          validUntil = new Date(validFrom.getTime() + lengthDays * day);
        } else if (roll < 0.85) {
          // Upcoming: starts in 1-5 days, lasts 5-14 days
          const startOffset = randInt(1, 5);
          const lengthDays = randInt(5, 14);
          validFrom = new Date(now.getTime() + startOffset * day);
          validUntil = new Date(validFrom.getTime() + lengthDays * day);
        } else {
          // Expired: ended 1-5 days ago
          const endOffset = -randInt(1, 5);
          const lengthDays = randInt(5, 14);
          validUntil = new Date(now.getTime() + endOffset * day);
          validFrom = new Date(validUntil.getTime() - lengthDays * day);
        }

        // Discount
        const discountType = oneOf(discountTypes);
        let discountValue = 0;
        if (discountType === 'percentage') discountValue = randInt(10, 40); // 10% - 40%
        if (discountType === 'fixed') discountValue = randInt(2, 15);      // $2 - $15
        if (discountType === 'buy_one_get_one') discountValue = 100;       // semantic

        // Scope
        const applicableProducts = sample(products, randInt(3, MAX_PRODUCTS_PER_OFFER)).map((p) => p._id);
        const applicableCategories = sample(shopCats, randInt(0, MAX_CATEGORIES_PER_OFFER)).map((c) => c._id);

        // Avoid creating duplicates with same title+shop within the same validity window
        const exists = await Offer.findOne({
          title,
          shop: shop._id,
          validFrom: { $lte: validUntil },
          validUntil: { $gte: validFrom },
        }).lean();

        if (exists) continue;

        await Offer.create({
          title,
          description,
          shop: shop._id,
          discountType,
          discountValue,
          applicableProducts,
          applicableCategories,
          validFrom,
          validUntil,
          terms: 'Applicable on selected items/categories. While stocks last.',
          image,
          isActive: true,
        });

        totalCreated++;
      }
      console.log(`Created offers for shop "${shop.name}"`);
    }

    console.log(`Seeding Offers complete (${IS_OPTION_1 ? 'Option 1 - Large' : 'Normal'}): ${totalCreated} new offers created.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Offer seed error:', err);
    process.exit(1);
  }
}

seed();
