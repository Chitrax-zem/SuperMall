require('dotenv').config();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../src/config/env');

const Product = require('../src/models/Product');
const Shop = require('../src/models/Shop');
const Offer = require('../src/models/Offer');

const PLACEHOLDER_PRODUCT = 'https://picsum.photos/800/600?blur=0';
const PLACEHOLDER_SHOP = 'https://picsum.photos/1200/800?blur=0';
const PLACEHOLDER_OFFER = 'https://picsum.photos/1400/600?blur=0';

function normalizeUrl(u) {
  if (!u || typeof u !== 'string') return null;
  let url = u.trim();

  // 1) Decode HTML entity & -> &
  url = url.replace(/&/g, '&');

  // 2) Ensure https:// if missing protocol and looks like a host
  if (!/^https?:\/\//i.test(url)) {
    if (/^\/\//.test(url)) {
      url = `https:${url}`;
    } else if (/^images\.unsplash\.com|^unsplash\.com|^picsum\.photos/i.test(url)) {
      url = `https://${url}`;
    }
  }

  // 3) If we see a URL that used &auto= without query, fix it to ?auto=
  // Example: https://images.unsplash.com/photo-xxx&auto=format -> https://...photo-xxx?auto=format
  if (!url.includes('?') && url.includes('&auto=')) {
    url = url.replace('&auto=', '?auto=');
  }

  return url;
}

async function fixArrayField(Model, placeholder) {
  const docs = await Model.find({}).select('_id images image').lean();
  let modified = 0;

  for (const doc of docs) {
    // Handle images array if present
    let images = Array.isArray(doc.images) ? doc.images.map(normalizeUrl).filter(Boolean) : [];

    // Backfill array placeholder if empty
    if (images.length === 0) images = [placeholder];

    // Handle single 'image' field (Offers have it)
    let single = doc.image ? normalizeUrl(doc.image) : null;
    if (single == null) single = placeholder;

    const update = {};
    let changed = false;

    // Compare arrays
    if (Array.isArray(doc.images)) {
      const sameLength = doc.images.length === images.length;
      const sameContent = sameLength && doc.images.every((v, i) => v === images[i]);
      if (!sameContent) {
        update.images = images;
        changed = true;
      }
    } else {
      update.images = images;
      changed = true;
    }

    // Compare image field
    if (typeof doc.image !== 'undefined') {
      if (doc.image !== single) {
        update.image = single;
        changed = true;
      }
    }

    if (changed) {
      await Model.updateOne({ _id: doc._id }, { $set: update });
      modified++;
    }
  }

  return modified;
}

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Normalizing image URLs...');

    const prod = await fixArrayField(Product, PLACEHOLDER_PRODUCT);
    console.log(`Products updated: ${prod}`);

    const shop = await fixArrayField(Shop, PLACEHOLDER_SHOP);
    console.log(`Shops updated: ${shop}`);

    const offer = await fixArrayField(Offer, PLACEHOLDER_OFFER);
    console.log(`Offers updated: ${offer}`);

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Normalization error:', err);
    process.exit(1);
  }
})();
