require('dotenv').config();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../src/config/env');

const Floor = require('../src/models/Floor');
const Category = require('../src/models/Category');
const Shop = require('../src/models/Shop');
const Product = require('../src/models/Product');
const Offer = require('../src/models/Offer');

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected for seeding');

    // Clean minimal sets
    await Promise.all([
      Floor.deleteMany({}),
      Category.deleteMany({}),
      Shop.deleteMany({}),
      Product.deleteMany({}),
      Offer.deleteMany({}),
    ]);

    // Floors
    const floor = await Floor.create({
      name: 'Ground Floor',
      floorNumber: 0,
      description: 'Main entry',
      facilities: ['Parking', 'Restrooms'],
      isActive: true,
    });

    // Categories
    const categories = await Category.insertMany([
      { name: 'Groceries', description: 'Daily essentials', isActive: true },
      { name: 'Handicrafts', description: 'Local crafts', isActive: true },
      { name: 'Electronics', description: 'Devices and accessories', isActive: true },
    ]);

    // Shop
    const shop = await Shop.create({
      name: 'Rural Mart',
      description: 'Local goods and essentials',
      owner: { name: 'Asha', email: 'asha@ruralmart.com', phone: '9990001112' },
      location: {
        floor: floor._id,
        shopNumber: 'G-12',
        address: { city: 'Jaipur', state: 'RJ', country: 'IN' },
      },
      categories: [categories[0]._id, categories[1]._id],
      contactInfo: { phone: '9990001112', email: 'info@ruralmart.com' },
      isActive: true,
    });

    // Products
    const products = await Product.insertMany([
      {
        name: 'Organic Millet',
        description: 'Locally sourced, healthy millet',
        shop: shop._id,
        category: categories[0]._id,
        price: 4.5,
        comparePrice: 5.5,
        images: [],
        features: ['High fiber', 'Locally grown'],
        stock: { quantity: 120, unit: 'kg' },
        tags: ['millet', 'organic'],
        rating: { average: 4.3, count: 12 },
        isActive: true,
        isFeatured: true, // ensures it shows on homepage
      },
      {
        name: 'Handwoven Basket',
        description: 'Eco-friendly bamboo basket',
        shop: shop._id,
        category: categories[1]._id,
        price: 12.0,
        images: [],
        features: ['Handmade', 'Sustainable'],
        stock: { quantity: 50, unit: 'piece' },
        tags: ['handicraft', 'basket'],
        rating: { average: 4.7, count: 8 },
        isActive: true,
        isFeatured: false,
      },
    ]);

    // Offer (Active right now)
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await Offer.create({
      title: 'Festival Savings',
      description: 'Save on local goods this week',
      shop: shop._id,
      discountType: 'percentage',
      discountValue: 15,
      applicableProducts: [products[0]._id],
      applicableCategories: [categories[1]._id],
      validFrom: now,
      validUntil: in7,
      terms: 'Valid until stocks last',
      isActive: true,
    });

    console.log('Seeding complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
