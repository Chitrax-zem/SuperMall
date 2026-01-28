import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaStar } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../styles/ShopList.css';

const ShopList = () => {
  const [searchParams] = useSearchParams();
  const [shops, setShops] = useState([]);
  const [floors, setFloors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    floor: searchParams.get('floor') || '',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
  });

  const fetchFloors = useCallback(async () => {
    try {
      const response = await api.get('/floors');
      setFloors(response.data.data || []);
    } catch {
      console.error('Failed to load floors');
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch {
      console.error('Failed to load categories');
    }
  }, []);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await api.get(`/shops?${params.toString()}`);
      setShops(response.data.data || []);
    } catch {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFloors();
    fetchCategories();
  }, [fetchFloors, fetchCategories]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((s) => ({ ...s, [name]: value }));
  };

  return (
    <div className="shop-list-page">
      <div className="container">
        <h1>Our Shops</h1>

        {/* Filters */}
        <div className="shop-filters">
          <input
            type="text"
            name="search"
            placeholder="Search shops..."
            value={filters.search}
            onChange={handleFilterChange}
            className="filter-input"
          />

          <select
            name="floor"
            value={filters.floor}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Floors</option>
            {floors.map((floor) => (
              <option key={floor._id} value={floor._id}>
                Floor {floor.floorNumber} - {floor.name}
              </option>
            ))}
          </select>

          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Shop List */}
        {loading ? (
          <div className="loading">Loading shops...</div>
        ) : shops.length === 0 ? (
          <div className="no-shops">No shops found</div>
        ) : (
          <div className="shops-grid">
            {shops.map((shop) => (
              <div key={shop._id} className="shop-card">
                <div className="shop-image">
                  <img
                    src={shop.images?.[0] || '/placeholder-shop.jpg'}
                    alt={shop.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder-shop.jpg';
                    }}
                  />
                </div>
                <div className="shop-content">
                  <h3>{shop.name}</h3>
                  <p className="shop-description">{shop.description}</p>

                  <div className="shop-location">
                    <FaMapMarkerAlt />
                    <span>
                      Floor {shop.location?.floor?.floorNumber}, Shop {shop.location?.shopNumber}
                    </span>
                  </div>

                  {shop.contactInfo?.phone && (
                    <div className="shop-phone">
                      <FaPhone />
                      <span>{shop.contactInfo.phone}</span>
                    </div>
                  )}

                  {shop.rating > 0 && (
                    <div className="shop-rating">
                      <FaStar className="star-icon" />
                      <span>{shop.rating.toFixed(1)}</span>
                    </div>
                  )}

                  <div className="shop-categories">
                    {shop.categories?.slice(0, 3).map((category) => (
                      <span key={category._id} className="category-tag">
                        {category.name}
                      </span>
                    ))}
                  </div>

                  <Link to={`/products?shop=${shop._id}`} className="btn btn-primary">
                    View Products
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopList;
