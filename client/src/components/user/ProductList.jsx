import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import FilterBar from './FilterBar';
import '../styles/ProductList.css';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    shop: searchParams.get('shop') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: searchParams.get('page') || 1,
  });

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch {
      console.error('Failed to load categories');
    }
  }, []);

  const fetchShops = useCallback(async () => {
    try {
      const response = await api.get('/shops');
      setShops(response.data.data || []);
    } catch {
      console.error('Failed to load shops');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data || []);
      setPagination(response.data.pagination || {});
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
    fetchShops();
  }, [fetchCategories, fetchShops]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    const merged = { ...filters, ...newFilters, page: 1 };
    setFilters(merged);

    const params = new URLSearchParams();
    Object.keys(merged).forEach((key) => {
      if (merged[key]) params.set(key, merged[key]);
    });
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const merged = { ...filters, page: newPage };
    setFilters(merged);

    const params = new URLSearchParams();
    Object.keys(merged).forEach((key) => {
      if (merged[key]) params.set(key, merged[key]);
    });
    setSearchParams(params);

    window.scrollTo(0, 0);
  };

  return (
    <div className="product-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Products</h1>
          <button
            className="btn-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>
        </div>

        <div className="product-list-container">
          <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
            <FilterBar
              filters={filters}
              categories={categories}
              shops={shops}
              onFilterChange={handleFilterChange}
            />
          </aside>

          <div className="products-main">
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <p>No products found</p>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((product) => (
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
                        <p className="product-category">
                          {product.category?.name}
                        </p>
                        <p className="product-shop">{product.shop?.name}</p>
                        <div className="product-footer">
                          <span className="price">${product.price}</span>
                          {product.comparePrice && (
                            <span className="compare-price">
                              ${product.comparePrice}
                            </span>
                          )}
                        </div>
                        {product.rating?.average > 0 && (
                          <div className="product-rating">
                            ⭐ {product.rating.average.toFixed(1)} ({product.rating.count})
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="btn-page"
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="btn-page"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
