import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaTags, FaStore, FaShoppingBag } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../styles/HomePage.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const [pRes, oRes, cRes] = await Promise.all([
          api.get('/products?featured=true&limit=12', { signal: controller.signal }),
          api.get('/offers?active=true&limit=4', { signal: controller.signal }),
          api.get('/categories', { signal: controller.signal }),
        ]);
        setFeaturedProducts(pRes.data.data || []);
        setActiveOffers(oRes.data.data || []);
        setCategories((cRes.data.data || []).slice(0, 6));
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          toast.error('Failed to load data');
        }
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to SuperMall</h1>
            <p>
              Discover products from rural merchants and connect local markets to
              the digital world
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">
                Browse Products <FaArrowRight />
              </Link>
              <Link to="/shops" className="btn btn-secondary">
                Explore Shops
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="category-card"
              >
                <div className="category-icon">
                  <FaShoppingBag />
                </div>
                <h3>{category.name}</h3>
                <p>{category.description || 'Explore products'}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="view-all">
              View All <FaArrowRight />
            </Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="product-card"
              >
                <div className="product-image">
                  <img
                    src={product.images?.[0] || '/placeholder.jpg'}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder.jpg';
                    }}
                  />
                  {product.isFeatured && (
                    <span className="badge badge-featured">Featured</span>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-shop">{product.shop?.name}</p>
                  <div className="product-footer">
                    <span className="price">${product.price}</span>
                    {product.comparePrice && (
                      <span className="compare-price">${product.comparePrice}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Active Offers */}
      <section className="offers-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <FaTags /> Active Offers
            </h2>
            <Link to="/offers" className="view-all">
              View All <FaArrowRight />
            </Link>
          </div>
          <div className="offers-grid">
            {activeOffers.map((offer) => (
              <div key={offer._id} className="offer-card">
                <div className="offer-badge">
                  {offer.discountType === 'percentage'
                    ? `${offer.discountValue}% OFF`
                    : `$${offer.discountValue} OFF`}
                </div>
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                <p className="offer-shop">
                  <FaStore /> {offer.shop?.name}
                </p>
                <p className="offer-validity">
                  Valid until: {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : '-'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
