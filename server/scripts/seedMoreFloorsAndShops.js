require('dotenv').config();
const mongoose = require('mongoose');

const { MONGODB_URI } = require('../src/config/env');
const Floor = require('../src/models/Floor');
const Category = require('../src/models/Category');
const Shop = require('../src/models/Shop');

// CLI arg "1" = Option 1 (bigger)
const MODE = (process.argv[2] || '').trim();
const IS_OPTION_1 = MODE === '1';

// Controls
const FLOORS_BASE = [
  { floorNumber: 0, name: 'Ground Floor', facilities: ['Parking', 'Restrooms', 'Info Desk'] },
  { floorNumber: 1, name: 'First Floor', facilities: ['ATM', 'Restrooms'] },
  { floorNumber: 2, name: 'Second Floor', facilities: ['Elevators', 'Restrooms'] },
  { floorNumber: 3, name: 'Third Floor', facilities: ['Restrooms'] },
  { floorNumber: 4, name: 'Food Court', facilities: ['Restrooms', 'Seating Area'] },
  { floorNumber: 5, name: 'Entertainment', facilities: ['Restrooms'] },
];
const FLOORS_EXTRA = [
  { floorNumber: 6, name: 'Kids Zone', facilities: ['Play Area', 'Restrooms'] },
  { floorNumber: 7, name: 'Home & Living', facilities: ['Restrooms'] },
];

const FLOORS = IS_OPTION_1 ? FLOORS_BASE.concat(FLOORS_EXTRA) : FLOORS_BASE;

// Shops per floor (approximate)
const SHOPS_PER_FLOOR = IS_OPTION_1 ? 10 : 5;

const oneOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Images (Unsplash)
const img = (u) => `${u}?auto=format&fit=crop&w=1200&q=80`;

const shopImagesByType = {
  groceries: [
    img('https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38'),
    img('https://images.unsplash.com/photo-1542838132-92c53300491e'),
    img('https://images.unsplash.com/photo-1504754524776-8f4f37790ca0'),
    img('https://images.unsplash.com/photo-1560807707-8cc77767d783'),
  ],
  electronics: [
    img('https://images.unsplash.com/photo-1517336714731-489689fd1ca8'),
    img('https://images.unsplash.com/photo-1518779578993-ec3579fee39f'),
    img('https://images.unsplash.com/photo-1555617117-08dd1f4848df'),
    img('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'),
  ],
  clothing: [
    img('https://images.unsplash.com/photo-1523381294911-8d3cead13475'),
    img('https://images.unsplash.com/photo-1520975693416-35a6c67e52a0'),
    img('https://images.unsplash.com/photo-1512436991641-6745cdb1723f'),
    img('https://images.unsplash.com/photo-1520975661595-6453be3f7070'),
  ],
  handicrafts: [
    img('https://images.unsplash.com/photo-1519710164239-da123dc03ef4'),
    img('https://images.unsplash.com/photo-1523419409543-a7f78af5f3c4'),
    img('https://images.unsplash.com/photo-1503602642458-232111445657'),
    img('https://images.unsplash.com/photo-1472908163257-60b6c701fd55'),
  ],
  bakery: [
    img('https://images.unsplash.com/photo-1541167760496-1628856ab772'),
    img('https://images.unsplash.com/photo-1514996937319-344454492b37'),
    img('https://images.unsplash.com/photo-1486427944299-d1955d23e34d'),
    img('https://images.unsplash.com/photo-1542838132-92c53300491e'),
  ],
  toys: [
    img('https://images.unsplash.com/photo-1542996966-2e31c00bae40'),
    img('https://images.unsplash.com/photo-1580537659460-4060b7ee0c21'),
    img('https://images.unsplash.com/photo-1458530970867-aaa3700e966d'),
    img('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9'),
  ],
  tools: [
    img('https://images.unsplash.com/photo-1518546305927-5a555bb7020d'),
    img('https://images.unsplash.com/photo-1517433456452-f9633a875f6f'),
    img('https://images.unsplash.com/photo-1504148455329-4ff0802cfb7e'),
    img('https://images.unsplash.com/photo-1556761175-4b46a572b786'),
  ],
  beauty: [
    img('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9'),
    img('https://images.unsplash.com/photo-1535639818669-74f6c4f9a448'),
    img('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2'),
    img('https://images.unsplash.com/photo-1542834369-f10ebf06d3cb'),
  ],
  kitchen: [
    img('https://images.unsplash.com/photo-1546069901-ba9599a7e63c'),
    img('https://images.unsplash.com/photo-1517256064527-09c73fc73e63'),
    img('https://images.unsplash.com/photo-1526318472351-c75fcf070305'),
    img('https://images.unsplash.com/photo-1464618663641-bbdd760ae84a'),
  ],
  gardening: [
    img('https://images.unsplash.com/photo-1492496913980-501348b61469'),
    img('https://images.unsplash.com/photo-1466695108335-44674aa2058a'),
    img('https://images.unsplash.com/photo-1441974231531-c6227db76b6e'),
    img('https://images.unsplash.com/photo-1501004318641-b39e6451bec6'),
  ],
  home: [
    img('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'),
    img('https://images.unsplash.com/photo-1501045661006-fcebe0257c3f'),
    img('https://images.unsplash.com/photo-1493666438817-866a91353ca9'),
    img('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'),
  ],
  spices: [
    img('https://images.unsplash.com/photo-1498601761256-1f07cdbcf0eb'),
    img('https://images.unsplash.com/photo-1544947950-fa07a98d237f'),
    img('https://images.unsplash.com/photo-1519681393784-d120267933ba'),
    img('https://images.unsplash.com/photo-1604908554027-e9e5f933c394'),
  ],
  dairy: [
    img('https://images.unsplash.com/photo-1580910051074-3eb694886505'),
    img('https://images.unsplash.com/photo-1514986888952-8cd320577b68'),
    img('https://images.unsplash.com/photo-1550581190-9c1c48d21d6c'),
    img('https://images.unsplash.com/photo-1560807707-8cc77767d783'),
  ],
};


const SHOP_TYPES = [
  { label: 'Grocer’s Hub', key: 'groceries', category: 'Groceries' },
  { label: 'ElectroHub', key: 'electronics', category: 'Electronics' },
  { label: 'Fashion Lane', key: 'clothing', category: 'Clothing' },
  { label: 'Craft Corner', key: 'handicrafts', category: 'Handicrafts' },
  { label: 'Bake House', key: 'bakery', category: 'Bakery' },
  { label: 'Toy Planet', key: 'toys', category: 'Toys' },
  { label: 'Tool Forge', key: 'tools', category: 'Tools' },
  { label: 'Beauty Bloom', key: 'beauty', category: 'Beauty' },
  { label: 'Kitchen Pro', key: 'kitchen', category: 'Kitchen' },
  { label: 'Garden Grove', key: 'gardening', category: 'Gardening' },
  { label: 'Home Harmony', key: 'home', category: 'Home Decor' },
  { label: 'Spice Route', key: 'spices', category: 'Spices' },
  { label: 'Dairy Delight', key: 'dairy', category: 'Dairy' },
];

async function ensureCategory(name, description) {
  let c = await Category.findOne({ name });
  if (!c) c = await Category.create({ name, description: description || name, isActive: true });
  if (!c.isActive) {
    c.isActive = true;
    await c.save();
  }
  return c;
}

async function ensureCategories() {
  const cats = {};
  cats.Groceries   = await ensureCategory('Groceries', 'Daily essentials');
  cats.Handicrafts = await ensureCategory('Handicrafts', 'Local crafts');
  cats.Electronics = await ensureCategory('Electronics', 'Devices and accessories');
  cats.Clothing    = await ensureCategory('Clothing', 'Apparel and fashion');
  cats.Bakery      = await ensureCategory('Bakery', 'Fresh baked goods');
  cats.Toys        = await ensureCategory('Toys', 'Playtime and fun');
  cats.Tools       = await ensureCategory('Tools', 'Hand tools and utility');
  cats.Beauty      = await ensureCategory('Beauty', 'Cosmetics and care');
  cats.Kitchen     = await ensureCategory('Kitchen', 'Cookware and utensils');
  cats.Gardening   = await ensureCategory('Gardening', 'Tools and accessories');
  cats['Home Decor'] = await ensureCategory('Home Decor', 'Furnish and decorate');
  cats.Spices      = await ensureCategory('Spices', 'Aromatic spices and blends');
  cats.Dairy       = await ensureCategory('Dairy', 'Milk and dairy products');
  return cats;
}

async function ensureFloors() {
  const out = [];
  for (const f of FLOORS) {
    let floor = await Floor.findOne({ floorNumber: f.floorNumber });
    if (!floor) {
      floor = await Floor.create({
        name: f.name,
        floorNumber: f.floorNumber,
        description: `${f.name} - diverse shops`,
        facilities: f.facilities,
        isActive: true,
      });
    } else if (!floor.isActive) {
      floor.isActive = true;
      await floor.save();
    }
    out.push(floor);
  }
  return out;
}

function buildShopName(base, floorNumber, idx) {
  const suffix = randInt(1, 99);
  return `${base} F${floorNumber}-${idx}${suffix}`;
}

function pickImagesForType(key) {
  const pool = shopImagesByType[key] || shopImagesByType.groceries;
  const count = randInt(1, Math.min(3, pool.length));
  const copy = [...pool];
  const imgs = [];
  for (let i = 0; i < count; i++) {
    imgs.push(oneOf(copy));
  }
  return imgs;
}

function randomPhone() {
  return `9${randInt(10, 99)}-${randInt(100, 999)}-${randInt(1000, 9999)}`;
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected for seeding floors & shops');

    const categories = await ensureCategories();
    const floors = await ensureFloors();

    let createdFloors = floors.length;
    let createdShops = 0;

    for (const floor of floors) {
      for (let i = 0; i < SHOPS_PER_FLOOR; i++) {
        const type = oneOf(SHOP_TYPES);
        const name = buildShopName(type.label, floor.floorNumber, i + 1);
        const images = pickImagesForType(type.key);
        const rating = Number((Math.random() * 1.5 + 3.5).toFixed(1)); // 3.5 - 5.0
        const categoryRef = categories[type.category] || categories.Groceries;

        // Avoid duplicate on floor + shopNumber + name
        const shopNumber = `${floor.floorNumber}-${String(randInt(1, 99)).padStart(2, '0')}`;
        const exists = await Shop.findOne({
          name,
          'location.floor': floor._id,
          'location.shopNumber': shopNumber,
        }).lean();

        if (exists) continue;

        await Shop.create({
          name,
          description: `Your trusted ${type.label} on ${floor.name}`,
          owner: {
            name: oneOf(['Asha', 'Ravi', 'Kiran', 'Meera', 'Vikram', 'Nisha']),
            email: `${type.key}.${randInt(100, 999)}@shopmail.com`,
            phone: randomPhone(),
          },
          location: {
            floor: floor._id,
            shopNumber,
            address: { city: 'Jaipur', state: 'RJ', country: 'IN' },
          },
          categories: [categoryRef._id],
          images,
          contactInfo: {
            phone: randomPhone(),
            email: `${type.key}.${randInt(100, 999)}@store.com`,
            website: `https://www.${type.key}${randInt(1, 99)}.store`,
          },
          operatingHours: {
            monday: { open: '10:00', close: '21:00' },
            tuesday: { open: '10:00', close: '21:00' },
            wednesday: { open: '10:00', close: '21:00' },
            thursday: { open: '10:00', close: '21:00' },
            friday: { open: '10:00', close: '21:00' },
            saturday: { open: '10:00', close: '22:00' },
            sunday: { open: '11:00', close: '20:00' },
          },
          rating,
          isActive: true,
        });

        createdShops++;
      }
    }

    console.log(`Seeding complete: floors=${createdFloors}, new shops=${createdShops}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
