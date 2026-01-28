require('dotenv').config();
const mongoose = require('mongoose');

const { MONGODB_URI } = require('../src/config/env');
const Floor = require('../src/models/Floor');
const Category = require('../src/models/Category');
const Shop = require('../src/models/Shop');
const Product = require('../src/models/Product');

// CLI arg: "1" means Option 1 (bigger catalog)
const MODE = (process.argv[2] || '').trim();
const IS_OPTION_1 = MODE === '1';

// Sizing knobs (tuned for normal vs option 1)
const BASE_VARIANTS_PER_PRODUCT = IS_OPTION_1 ? 10 : 3; // how many variants per base product
const EXTRA_RANDOM_PRODUCTS = IS_OPTION_1 ? 80 : 20;    // additional random SKUs on top
const ADD_SECOND_SHOP = IS_OPTION_1;                    // add "Village Bazaar" to diversify

// Helpers
const img = (u) => `${u}?auto=format&fit=crop&w=1200&q=80`; 
const oneOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
const bool = (p = 0.5) => Math.random() < p;

const adjectives = [
  'Premium', 'Classic', 'Signature', 'Eco', 'Ultra', 'Compact', 'Pro', 'Lite',
  'Deluxe', 'Essential', 'Fresh', 'Organic', 'Handmade', 'Artisan', 'Smart',
];
const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Amber', 'Olive', 'Teal', 'Purple'];
const sizes = ['Mini', 'Small', 'Medium', 'Large', 'XL', 'XXL'];
const variants = ['V1', 'V2', 'V3', 'Edition', 'Plus', 'Max'];

const images = {
  groceries: [
    img('https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38'),
    img('https://images.unsplash.com/photo-1542838132-92c53300491e'),
    img('https://images.unsplash.com/photo-1504754524776-8f4f37790ca0'),
    img('https://images.unsplash.com/photo-1560807707-8cc77767d783'),
    img('https://images.unsplash.com/photo-1506806732259-39c2d0268443'),
    img('https://images.unsplash.com/photo-1524594154908-edd2f99cdd0e'),
  ],
  electronics: [
    img('https://images.unsplash.com/photo-1518779578993-ec3579fee39f'),
    img('https://images.unsplash.com/photo-1517336714731-489689fd1ca8'),
    img('https://images.unsplash.com/photo-1555617117-08dd1f4848df'),
    img('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9'),
    img('https://images.unsplash.com/photo-1510557880182-3d4d3cba35b5'),
    img('https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc'),
  ],
  clothing: [
    img('https://images.unsplash.com/photo-1523381294911-8d3cead13475'),
    img('https://images.unsplash.com/photo-1520975693416-35a6c67e52a0'),
    img('https://images.unsplash.com/photo-1512436991641-6745cdb1723f'),
    img('https://images.unsplash.com/photo-1520975661595-6453be3f7070'),
    img('https://images.unsplash.com/photo-1520975954732-35b174af0b82'),
    img('https://images.unsplash.com/photo-1520974735194-6b35c6b4f81b'),
  ],
  handicrafts: [
    img('https://images.unsplash.com/photo-1519710164239-da123dc03ef4'),
    img('https://images.unsplash.com/photo-1523419409543-a7f78af5f3c4'),
    img('https://images.unsplash.com/photo-1503602642458-232111445657'),
    img('https://images.unsplash.com/photo-1519681393784-d120267933ba'),
    img('https://images.unsplash.com/photo-1520975693416-35a6c67e52a0'),
    img('https://images.unsplash.com/photo-1472908163257-60b6c701fd55'),
  ],
  home: [
    img('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'),
    img('https://images.unsplash.com/photo-1501045661006-fcebe0257c3f'),
    img('https://images.unsplash.com/photo-1493666438817-866a91353ca9'),
    img('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'),
    img('https://images.unsplash.com/photo-1493809842364-78817add7ffb'),
    img('https://images.unsplash.com/photo-1501045661006-8bf2d90d3cd1'),
  ],
  bakery: [
    img('https://images.unsplash.com/photo-1514996937319-344454492b37'),
    img('https://images.unsplash.com/photo-1541167760496-1628856ab772'),
    img('https://images.unsplash.com/photo-1542838132-92c53300491e'),
    img('https://images.unsplash.com/photo-1486427944299-d1955d23e34d'),
    img('https://images.unsplash.com/photo-1541781774459-bb2af2f05b55'),
    img('https://images.unsplash.com/photo-1519681393784-d120267933ba'),
  ],
  spices: [
    img('https://images.unsplash.com/photo-1498601761256-1f07cdbcf0eb'),
    img('https://images.unsplash.com/photo-1544947950-fa07a98d237f'),
    img('https://images.unsplash.com/photo-1542332213-26fc5f6d8f0e'),
    img('https://images.unsplash.com/photo-1604908554027-e9e5f933c394'),
    img('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9'),
    img('https://images.unsplash.com/photo-1505575972945-2804f6c56d68'),
  ],
  dairy: [
    img('https://images.unsplash.com/photo-1580910051074-3eb694886505'),
    img('https://images.unsplash.com/photo-1514986888952-8cd320577b68'),
    img('https://images.unsplash.com/photo-1550581190-9c1c48d21d6c'),
    img('https://images.unsplash.com/photo-1563630423918-b64b060f1b7c'),
    img('https://images.unsplash.com/photo-1560807707-8cc77767d783'),
    img('https://images.unsplash.com/photo-1473181488821-2d23949a045a'),
  ],
  toys: [
    img('https://images.unsplash.com/photo-1542996966-2e31c00bae40'),
    img('https://images.unsplash.com/photo-1580537659460-4060b7ee0c21'),
    img('https://images.unsplash.com/photo-1458530970867-aaa3700e966d'),
    img('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9'),
    img('https://images.unsplash.com/photo-1585386959984-a4155223168f'),
    img('https://images.unsplash.com/photo-1596464716121-e200bd1b4a0c'),
  ],
  tools: [
    img('https://images.unsplash.com/photo-1518546305927-5a555bb7020d'),
    img('https://images.unsplash.com/photo-1517433456452-f9633a875f6f'),
    img('https://images.unsplash.com/photo-1504148455329-4ff0802cfb7e'),
    img('https://images.unsplash.com/photo-1556761175-4b46a572b786'),
    img('https://images.unsplash.com/photo-1505852679233-d9fd70aff56d'),
    img('https://images.unsplash.com/photo-1468495244123-6d96edb309d8'),
  ],
  beauty: [
    img('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9'),
    img('https://images.unsplash.com/photo-1535639818669-74f6c4f9a448'),
    img('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2'),
    img('https://images.unsplash.com/photo-1542834369-f10ebf06d3cb'),
    img('https://images.unsplash.com/photo-1522336572468-97b06e8ef143'),
    img('https://images.unsplash.com/photo-1512496015851-a90fb38ba796'),
  ],
  kitchen: [
    img('https://images.unsplash.com/photo-1546069901-ba9599a7e63c'),
    img('https://images.unsplash.com/photo-1517256064527-09c73fc73e63'),
    img('https://images.unsplash.com/photo-1526318472351-c75fcf070305'),
    img('https://images.unsplash.com/photo-1464618663641-bbdd760ae84a'),
    img('https://images.unsplash.com/photo-1512621776951-4b8c1a1a0b36'),
    img('https://images.unsplash.com/photo-1572635196237-14b3f281503f'),
  ],
  gardening: [
    img('https://images.unsplash.com/photo-1492496913980-501348b61469'),
    img('https://images.unsplash.com/photo-1466695108335-44674aa2058a'),
    img('https://images.unsplash.com/photo-1441974231531-c6227db76b6e'),
    img('https://images.unsplash.com/photo-1501004318641-b39e6451bec6'),
    img('https://images.unsplash.com/photo-1501004318641-40f9e3c6053e'),
    img('https://images.unsplash.com/photo-1501004318641-1488b5a2a38d'),
  ],
};




async function ensureCategory(name, description) {
  let cat = await Category.findOne({ name });
  if (!cat) {
    cat = await Category.create({ name, description, isActive: true });
  } else if (!cat.isActive) {
    cat.isActive = true;
    await cat.save();
  }
  return cat;
}

async function ensureFloor() {
  let floor = await Floor.findOne({ floorNumber: 0 });
  if (!floor) {
    floor = await Floor.create({
      name: 'Ground Floor',
      floorNumber: 0,
      description: 'Main entry',
      facilities: ['Parking', 'Restrooms'],
      isActive: true,
    });
  }
  return floor;
}

async function ensureShop(name, floor) {
  let shop = await Shop.findOne({ name });
  if (!shop) {
    shop = await Shop.create({
      name,
      description: name === 'Rural Mart' ? 'Local goods and essentials' : 'Curated village marketplace',
      owner: {
        name: name === 'Rural Mart' ? 'Asha' : 'Ravi',
        email: name === 'Rural Mart' ? 'asha@ruralmart.com' : 'ravi@villagebazaar.com',
        phone: name === 'Rural Mart' ? '9990001112' : '9990002223',
      },
      location: {
        floor: floor._id,
        shopNumber: name === 'Rural Mart' ? 'G-12' : 'G-18',
        address: { city: 'Jaipur', state: 'RJ', country: 'IN' },
      },
      categories: [],
      contactInfo: { phone: '9990000000', email: 'info@' + name.toLowerCase().replace(' ', '') + '.com' },
      isActive: true,
    });
  }
  return shop;
}

function buildName(base) {
  const parts = [oneOf(adjectives), base, oneOf(colors), oneOf(sizes), oneOf(variants)];
  return parts.filter(Boolean).join(' ');
}

function productDoc({
  name,
  description,
  shop,
  category,
  price,
  comparePrice,
  imgs,
  isFeatured = false,
  tags = [],
  features = [],
}) {
  const quantity = Math.floor(Math.random() * 240) + 12;
  return {
    name,
    description,
    shop,
    category,
    price,
    comparePrice: comparePrice || undefined,
    images: imgs && imgs.length ? imgs : ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80'],
    features: features.length ? features : ['Quality assured', 'Satisfaction guaranteed'],
    stock: { quantity, unit: 'piece' },
    tags,
    rating: {
      average: Number((Math.random() * 2 + 3).toFixed(1)),
      count: Math.floor(Math.random() * 400) + 10,
    },
    isActive: true,
    isFeatured,
  };
}

function baseProducts(shop, cats) {
  return [
    {
      base: 'Organic Millet (1kg)',
      desc: 'Locally sourced, high fiber millet',
      cat: cats.Groceries,
      price: 4.5,
      compare: 5.5,
      imgs: images.groceries,
      featured: true,
      tags: ['millet', 'organic'],
      features: ['High fiber', 'Locally grown'],
    },
    {
      base: 'Handwoven Bamboo Basket',
      desc: 'Eco-friendly handmade basket',
      cat: cats.Handicrafts,
      price: 12.0,
      imgs: images.handicrafts,
      tags: ['handicraft', 'basket'],
      features: ['Handmade', 'Sustainable'],
    },
    {
      base: 'Wireless Headphones',
      desc: 'Over-ear, noise isolation, long battery life',
      cat: cats.Electronics,
      price: 49.99,
      compare: 69.99,
      imgs: images.electronics,
      featured: true,
      tags: ['audio', 'wireless'],
    },
    {
      base: 'Cotton Kurta',
      desc: 'Breathable traditional wear',
      cat: cats.Clothing,
      price: 19.99,
      imgs: images.clothing,
      tags: ['kurta', 'cotton'],
    },
    {
      base: 'Clay Vase',
      desc: 'Minimal pottery for your home',
      cat: cats['Home Decor'],
      price: 15.0,
      imgs: images.home,
      tags: ['vase', 'decor'],
    },
    {
      base: 'Sourdough Bread',
      desc: 'Crusty artisan sourdough loaf',
      cat: cats.Bakery,
      price: 3.75,
      imgs: images.bakery,
      tags: ['bread', 'sourdough'],
    },
    {
      base: 'Garam Masala Blend',
      desc: 'Aromatic spice mix for rich curries',
      cat: cats.Spices,
      price: 2.5,
      imgs: images.spices,
      tags: ['spices', 'blend'],
    },
    {
      base: 'Paneer (200g)',
      desc: 'Soft and fresh cottage cheese',
      cat: cats.Dairy,
      price: 2.2,
      imgs: images.dairy,
      tags: ['paneer', 'dairy'],
    },
    {
      base: 'Wooden Toy Car',
      desc: 'Smooth finish, safe edges, toddler friendly',
      cat: cats.Toys,
      price: 6.5,
      imgs: images.toys,
      tags: ['toy', 'wooden'],
    },
    {
      base: 'Multi-purpose Hammer',
      desc: 'Durable steel head and ergonomic grip',
      cat: cats.Tools,
      price: 7.99,
      imgs: images.tools,
      tags: ['hammer', 'tool'],
    },
    // extra variety (Option 1 benefits from these)
    {
      base: 'Running Shoes',
      desc: 'Breathable upper and flexible sole',
      cat: cats.Footwear,
      price: 39.99,
      compare: 59.99,
      imgs: [
        img('https://images.unsplash.com/photo-1542291026-7eec264c27ff'),
        img('https://images.unsplash.com/photo-1519741497674-611481863552'),
      ],
      tags: ['shoes', 'running'],
    },
    {
      base: 'Herbal Face Cream',
      desc: 'Natural ingredients for daily nourishment',
      cat: cats.Beauty,
      price: 8.5,
      imgs: images.beauty,
      tags: ['cream', 'herbal'],
    },
    {
      base: 'Notebook Set',
      desc: 'A5 ruled notebooks, pack of 3',
      cat: cats.Stationery,
      price: 3.99,
      imgs: [
        img('https://images.unsplash.com/photo-1515879218367-8466d910aaa4'),
        img('https://images.unsplash.com/photo-1509223197845-458d87318791'),
      ],
      tags: ['notebook', 'stationery'],
    },
    {
      base: 'Non-stick Pan',
      desc: 'Even heat distribution, easy clean',
      cat: cats.Kitchen,
      price: 14.99,
      imgs: images.kitchen,
      tags: ['pan', 'kitchen'],
    },
    {
      base: 'Garden Pruner',
      desc: 'Stainless steel blades, soft grip',
      cat: cats.Gardening,
      price: 9.99,
      imgs: images.gardening,
      tags: ['pruner', 'garden'],
    },
  ].map((p) =>
    productDoc({
      name: p.base,
      description: p.desc,
      shop: shop._id,
      category: p.cat._id,
      price: p.price,
      comparePrice: p.compare,
      imgs: p.imgs,
      isFeatured: !!p.featured,
      tags: p.tags || [],
      features: p.features || [],
    })
  );
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected for seeding (seedMoreProducts)');

    // Ensure floor
    const floor = await ensureFloor();

    // Ensure categories
    const cats = {};
    cats.Groceries   = await ensureCategory('Groceries', 'Daily essentials');
    cats.Handicrafts = await ensureCategory('Handicrafts', 'Local crafts');
    cats.Electronics = await ensureCategory('Electronics', 'Devices and accessories');
    cats.Clothing    = await ensureCategory('Clothing', 'Apparel and fashion');
    cats['Home Decor'] = await ensureCategory('Home Decor', 'Furnish and decorate');
    cats.Bakery      = await ensureCategory('Bakery', 'Fresh baked goods');
    cats.Spices      = await ensureCategory('Spices', 'Aromatic spices and blends');
    cats.Dairy       = await ensureCategory('Dairy', 'Milk and dairy products');
    cats.Toys        = await ensureCategory('Toys', 'Playtime and fun');
    cats.Tools       = await ensureCategory('Tools', 'Hand tools and utility');
    // extra for variety
    cats.Footwear    = await ensureCategory('Footwear', 'Shoes and sandals');
    cats.Beauty      = await ensureCategory('Beauty', 'Cosmetics and care');
    cats.Stationery  = await ensureCategory('Stationery', 'Essentials for study & office');
    cats.Kitchen     = await ensureCategory('Kitchen', 'Cookware and utensils');
    cats.Gardening   = await ensureCategory('Gardening', 'Tools and accessories');

    // Ensure shops
    const ruralMart = await ensureShop('Rural Mart', floor);
    const villageBazaar = ADD_SECOND_SHOP ? await ensureShop('Village Bazaar', floor) : null;

    // assign categories to shops
    ruralMart.categories = Object.values(cats).slice(0, 8).map((c) => c._id);
    await ruralMart.save();

    if (villageBazaar) {
      villageBazaar.categories = Object.values(cats).slice(6).map((c) => c._id);
      await villageBazaar.save();
    }

    // Create a base catalog for each shop
    const baseRural = baseProducts(ruralMart, cats);
    const baseVillage = villageBazaar ? baseProducts(villageBazaar, cats) : [];

    // Expand with variants
    const expandVariants = (prodList) => {
      const expanded = [];
      for (const p of prodList) {
        expanded.push(p);
        for (let i = 0; i < BASE_VARIANTS_PER_PRODUCT; i++) {
          const name = buildName(p.name.replace(/ - .+$/, ''));
          const price = Number((p.price + Math.random() * 3 - 1).toFixed(2));
          expanded.push(
            productDoc({
              ...p,
              name: `${name}`,
              price,
              comparePrice: bool(0.4) ? Number((price + Math.random() * 5 + 2).toFixed(2)) : undefined,
              imgs: p.images && p.images.length ? p.images : p.imgs,
              isFeatured: bool(0.3),
            })
          );
        }
      }
      return expanded;
    };

    let allProducts = [...expandVariants(baseRural), ...expandVariants(baseVillage)];

    // Extra random SKUs (sprinkle across categories and shops)
    const allCats = Object.values(cats);
    const shops = [ruralMart].concat(villageBazaar ? [villageBazaar] : []);
    for (let i = 0; i < EXTRA_RANDOM_PRODUCTS; i++) {
      const cat = oneOf(allCats);
      const shop = oneOf(shops);
      const baseName = oneOf([
        'Bundle Pack', 'Gift Set', 'Value Combo', 'Starter Kit', 'Essentials Pack',
        'Travel Pack', 'Family Pack', 'Mega Pack',
      ]);
      allProducts.push(
        productDoc({
          name: buildName(baseName),
          description: 'Carefully curated set for everyday use',
          shop: shop._id,
          category: cat._id,
          price: Number((Math.random() * 50 + 3).toFixed(2)),
          comparePrice: bool(0.5) ? Number((Math.random() * 60 + 6).toFixed(2)) : undefined,
          imgs: oneOf(Object.values(images)),
          isFeatured: bool(0.25),
          tags: ['bundle', 'value'],
        })
      );
    }

    // Upsert-like: avoid duplicates (by name + shop)
    let created = 0;
    for (const p of allProducts) {
      const exists = await Product.findOne({ name: p.name, shop: p.shop });
      if (!exists) {
        await Product.create(p);
        created++;
      }
    }

    console.log(
      `Seeding complete (mode: ${IS_OPTION_1 ? 'Option 1 - Large' : 'Normal'}). ` +
      `Created ${created} new products across ${shops.length} shop(s).`
    );
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
