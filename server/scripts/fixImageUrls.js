// server/scripts/fixImageUrls.js
require('dotenv').config();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../src/config/env');

const Product = require('../src/models/Product');
const Shop = require('../src/models/Shop');
const Offer = require('../src/models/Offer');

// Consistent high-quality placeholders (brand-friendly Unsplash)
const PRODUCT_PLACEHOLDER = 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80';
const SHOP_PLACEHOLDER    = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80';
const OFFER_PLACEHOLDER   = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1600&q=80';

// Host allowlist for quick protocol normalization
const KNOWN_HOSTS = [
  'images.unsplash.com',
  'unsplash.com',
  'picsum.photos',
  'images.pexels.com',
  'cdn.pixabay.com',
];

// Query params we want on images for consistent rendering
const DEFAULT_IMG_QUERY = 'auto=format&fit=crop&w=1200&q=80';
const DEFAULT_BANNER_QUERY = 'auto=format&fit=crop&w=1600&q=80';

function ensureHttpsProtocol(url) {
  if (!/^https?:\/\//i.test(url)) {
    if (url.startsWith('//')) return `https:${url}`;
    const host = url.split('/')[0].toLowerCase();
    if (KNOWN_HOSTS.includes(host)) return `https://${url}`;
  }
  return url;
}

function normalizeEntities(url) {
  // Fix common HTML entity encodings that break query strings
  return url
    .replace(/&/g, '&')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/</g, '<')
    .replace(/>/g, '>');
}

function enforceQueryParams(url, isBanner = false) {
  // If it’s an Unsplash/known CDN and has no query, append defaults
  try {
    const u = new URL(url);
    const isKnown = KNOWN_HOSTS.some(h => u.hostname.endsWith(h));
    if (isKnown) {
      if (!u.search || u.search === '?') {
        const params = isBanner ? DEFAULT_BANNER_QUERY : DEFAULT_IMG_QUERY;
        return `${u.origin}${u.pathname}?${params}`;
      }
    }
    return url;
  } catch {
    return url;
  }
}

function dropTrailingArtifacts(url) {
  // Remove trailing commas or stray characters that can appear in bad data
  return url.replace(/[,;\s]+$/, '');
}

function normalizeUnsplashPath(url) {
  // Some bad copies put &auto before ?auto; repair it
  // ex: https://images.unsplash.com/photo-xxx&auto=format -> ...photo-xxx?auto=format
  if (!url.includes('?') && url.includes('&auto=')) {
    return url.replace('&auto=', '?auto=');
  }
  if (!url.includes('?') && url.includes('&fit=')) {
    return url.replace('&fit=', '?fit=');
  }
  return url;
}

function sanitizeUrl(u, opts = { banner: false }) {
  if (!u || typeof u !== 'string') return null;
  let url = u.trim();
  if (!url) return null;

  url = normalizeEntities(url);
  url = dropTrailingArtifacts(url);
  url = ensureHttpsProtocol(url);
  url = normalizeUnsplashPath(url);
  url = enforceQueryParams(url, opts.banner);

  // Quick guard: basic http(s) sanity
  if (!/^https?:\/\//i.test(url)) return null;
  return url;
}

// Compare arrays deeply (by value and order)
function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// Generic fixer for models
async function fixModelImages(Model, { placeholder, hasSingleImage = false, singleIsBanner = false, label }) {
  const select = hasSingleImage ? '_id images image' : '_id images';
  const docs = await Model.find({}).select(select).lean();
  let updated = 0;
  let skipped = 0;

  // Process in small batches to reduce memory spikes
  const BATCH = 200;
  for (let i = 0; i < docs.length; i += BATCH) {
    const chunk = docs.slice(i, i + BATCH);
    // Concurrency window
    await Promise.all(chunk.map(async (d) => {
      const originalImages = Array.isArray(d.images) ? d.images : [];
      const fixedImages = originalImages
        .map((x) => sanitizeUrl(x))
        .filter(Boolean);

      const finalImages = fixedImages.length > 0 ? fixedImages : [placeholder];

      const update = {};
      let changed = false;

      if (!arraysEqual(originalImages, finalImages)) {
        update.images = finalImages;
        changed = true;
      }

      if (hasSingleImage) {
        const normalizedSingle = sanitizeUrl(d.image, { banner: singleIsBanner });
        const finalSingle = normalizedSingle || placeholder;
        if (finalSingle !== d.image) {
          update.image = finalSingle;
          changed = true;
        }
      }

      if (changed) {
        await Model.updateOne({ _id: d._id }, { $set: update });
        updated += 1;
      } else {
        skipped += 1;
      }
    }));
  }

  console.log(`• ${label}: updated=${updated}, unchanged=${skipped}, total=${docs.length}`);
  return { updated, skipped, total: docs.length };
}

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: undefined });
    console.log('🔧 Fixing image URLs...\n');

    const productRes = await fixModelImages(Product, {
      placeholder: PRODUCT_PLACEHOLDER,
      hasSingleImage: false,
      label: 'Products',
    });

    const shopRes = await fixModelImages(Shop, {
      placeholder: SHOP_PLACEHOLDER,
      hasSingleImage: false,
      label: 'Shops',
    });

    const offerRes = await fixModelImages(Offer, {
      placeholder: OFFER_PLACEHOLDER,
      hasSingleImage: true,         // Offers often have a single image field
      singleIsBanner: true,         // Use banner-sized defaults for offers
      label: 'Offers',
    });

    console.log('\n✅ Summary');
    console.table([
      { Model: 'Products', Updated: productRes.updated, Unchanged: productRes.skipped, Total: productRes.total },
      { Model: 'Shops', Updated: shopRes.updated, Unchanged: shopRes.skipped, Total: shopRes.total },
      { Model: 'Offers', Updated: offerRes.updated, Unchanged: offerRes.skipped, Total: offerRes.total },
    ]);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ fixImageUrls error:', err);
    process.exit(1);
  }
})();
