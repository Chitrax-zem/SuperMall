import { useState, useEffect } from 'react';
import '../styles/FilterBar.css';

const FilterBar = ({ filters, categories = [], shops = [], onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState({
    search: filters?.search || '',
    category: filters?.category || '',
    shop: filters?.shop || '',
    minPrice: filters?.minPrice || '',
    maxPrice: filters?.maxPrice || '',
  });

  useEffect(() => {
    setLocalFilters({
      search: filters?.search || '',
      category: filters?.category || '',
      shop: filters?.shop || '',
      minPrice: filters?.minPrice || '',
      maxPrice: filters?.maxPrice || '',
    });
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    const cleaned = Object.fromEntries(
      Object.entries(localFilters).filter(([, val]) => val !== '')
    );
    onFilterChange(cleaned);
  };

  const handleReset = () => {
    const reset = { search: '', category: '', shop: '', minPrice: '', maxPrice: '' };
    setLocalFilters(reset);
    onFilterChange({});
  };

  return (
    <div className="filter-bar">
      <h3>Filters</h3>
      <div className="filter-group">
        <label>Search</label>
        <input
          type="text"
          name="search"
          placeholder="Search products..."
          value={localFilters.search}
          onChange={handleChange}
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label>Category</label>
        <select
          name="category"
          value={localFilters.category}
          onChange={handleChange}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Shop</label>
        <select
          name="shop"
          value={localFilters.shop}
          onChange={handleChange}
          className="filter-select"
        >
          <option value="">All Shops</option>
          {shops.map((shop) => (
            <option key={shop._id} value={shop._id}>{shop.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Price Range</label>
        <div className="price-range">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            value={localFilters.minPrice}
            onChange={handleChange}
            className="filter-input"
          />
          <span>-</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            value={localFilters.maxPrice}
            onChange={handleChange}
            className="filter-input"
          />
        </div>
      </div>

      <div className="filter-actions">
        <button onClick={handleApply} className="btn btn-primary">Apply Filters</button>
        <button onClick={handleReset} className="btn btn-secondary">Reset</button>
      </div>
    </div>
  );
};

export default FilterBar;
