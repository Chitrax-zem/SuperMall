import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../styles/CompareProducts.css';

const CompareProducts = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const productIds = searchParams.get('ids')?.split(',') || [];

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.post('/products/compare', { productIds });
      setProducts(response.data.data || []);
    } catch {
      toast.error('Failed to load products for comparison');
    } finally {
      setLoading(false);
    }
  }, [productIds]);

  useEffect(() => {
    if (productIds.length >= 2) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [productIds.length, fetchProducts]);

  const removeProduct = (productId) => {
    const updatedIds = productIds.filter((id) => id !== productId);
    window.location.href = `/compare?ids=${updatedIds.join(',')}`;
  };

  if (loading) {
    return <div className="loading">Loading comparison...</div>;
  }

  if (productIds.length < 2) {
    return (
      <div className="compare-empty">
        <h2>Product Comparison</h2>
        <p>Please select at least 2 products to compare</p>
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="compare-products-page">
      <div className="container">
        <h1>Compare Products</h1>

        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                {products.map((product) => (
                  <th key={`hdr-${product._id}`}>
                    <button
                      onClick={() => removeProduct(product._id)}
                      className="btn-remove"
                      title="Remove from comparison"
                    >
                      <FaTimes />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Product Images */}
              <tr>
                <td className="label-cell">Image</td>
                {products.map((product) => (
                  <td key={`img-${product._id}`}>
                    <img
                      src={product.images?.[0] || '/placeholder.jpg'}
                      alt={product.name}
                      className="compare-image"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                  </td>
                ))}
              </tr>

              {/* Product Names */}
              <tr>
                <td className="label-cell">Name</td>
                {products.map((product) => (
                  <td key={`name-${product._id}`}>
                    <Link to={`/products/${product._id}`}>{product.name}</Link>
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr>
                <td className="label-cell">Price</td>
                {products.map((product) => (
                  <td key={`price-${product._id}`}>
                    <span className="price">${product.price}</span>
                  </td>
                ))}
              </tr>

              {/* Shop */}
              <tr>
                <td className="label-cell">Shop</td>
                {products.map((product) => (
                  <td key={`shop-${product._id}`}>{product.shop?.name}</td>
                ))}
              </tr>

              {/* Category */}
              <tr>
                <td className="label-cell">Category</td>
                {products.map((product) => (
                  <td key={`cat-${product._id}`}>{product.category?.name}</td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td className="label-cell">Rating</td>
                {products.map((product) => (
                  <td key={`rating-${product._id}`}>
                    {product.rating?.average > 0
                      ? `⭐ ${product.rating.average.toFixed(1)}`
                      : 'No ratings'}
                  </td>
                ))}
              </tr>

              {/* Stock */}
              <tr>
                <td className="label-cell">Availability</td>
                {products.map((product) => (
                  <td key={`stock-${product._id}`}>
                    {product.stock.quantity > 0 ? (
                      <span className="in-stock">In Stock</span>
                    ) : (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Description */}
              <tr>
                <td className="label-cell">Description</td>
                {products.map((product) => (
                  <td key={`desc-${product._id}`}>{product.description}</td>
                ))}
              </tr>

              {/* Features */}
              <tr>
                <td className="label-cell">Features</td>
                {products.map((product) => (
                  <td key={`feat-${product._id}`}>
                    {product.features && product.features.length > 0 ? (
                      <ul className="feature-list">
                        {product.features.map((feature, index) => (
                          <li key={`${feature}-${index}`}>{feature}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="no-data">-</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Action */}
              <tr>
                <td className="label-cell">Action</td>
                {products.map((product) => (
                  <td key={`act-${product._id}`}>
                    <Link
                      to={`/products/${product._id}`}
                      className="btn btn-primary"
                    >
                      View Details
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompareProducts;
