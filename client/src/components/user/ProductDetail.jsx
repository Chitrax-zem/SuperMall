import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data);
    } catch {
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img
                src={product.images?.[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder.jpg';
                }}
              />
            </div>
            {product.images?.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className={selectedImage === index ? 'active' : ''}
                    onClick={() => setSelectedImage(index)}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder.jpg';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <h1>{product.name}</h1>

            <div className="product-meta">
              <span className="category">{product.category?.name}</span>
              {product.rating?.average > 0 && (
                <span className="rating">
                  ⭐ {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
                </span>
              )}
            </div>

            <div className="product-price">
              <span className="current-price">${product.price}</span>
              {product.comparePrice && (
                <span className="compare-price">${product.comparePrice}</span>
              )}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="product-features">
                <h3>Features</h3>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={`${feature}-${index}`}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && product.specifications.size > 0 && (
              <div className="product-specifications">
                <h3>Specifications</h3>
                <table>
                  <tbody>
                    {Array.from(product.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td className="spec-label">{key}</td>
                        <td className="spec-value">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Stock Info */}
            <div className="stock-info">
              <p>
                <strong>Availability:</strong>{' '}
                {product.stock.quantity > 0 ? (
                  <span className="in-stock">
                    In Stock ({product.stock.quantity} {product.stock.unit})
                  </span>
                ) : (
                  <span className="out-of-stock">Out of Stock</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Shop Information */}
        <div className="shop-info-section">
          <h2>
            <FaStore /> Shop Information
          </h2>
          <div className="shop-details">
            <h3>{product.shop?.name}</h3>

            {product.shop?.location && (
              <p>
                <FaMapMarkerAlt /> Floor {product.shop.location.floor?.floorNumber}, Shop {product.shop.location.shopNumber}
              </p>
            )}

            {product.shop?.contactInfo && (
              <div className="shop-contact">
                {product.shop.contactInfo.phone && (
                  <p>
                    <FaPhone /> {product.shop.contactInfo.phone}
                  </p>
                )}
                {product.shop.contactInfo.email && (
                  <p>
                    <FaEnvelope /> {product.shop.contactInfo.email}
                  </p>
                )}
              </div>
            )}

            {product.shop?.rating > 0 && (
              <p className="shop-rating">
                Shop Rating: ⭐ {product.shop.rating.toFixed(1)}
              </p>
            )}

            <Link to={`/products?shop=${product.shop._id}`} className="btn btn-secondary">
              View More Products from this Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
