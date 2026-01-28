import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaStore,
  FaBox,
  FaTags,
  FaThList,
  FaBuilding,
} from 'react-icons/fa';
import ShopManagement from './ShopManagement';
import ProductManagement from './ProductManagement';
import OfferManagement from './OfferManagement';
import CategoryManagement from './CategoryManagement';
import FloorManagement from './FloorManagement';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/admin/dashboard"
            className={`nav-item ${
              location.pathname === '/admin/dashboard' ? 'active' : ''
            }`}
          >
            <FaHome /> Dashboard
          </Link>
          <Link
            to="/admin/dashboard/shops"
            className={`nav-item ${isActive('shops') ? 'active' : ''}`}
          >
            <FaStore /> Shops
          </Link>
          <Link
            to="/admin/dashboard/products"
            className={`nav-item ${isActive('products') ? 'active' : ''}`}
          >
            <FaBox /> Products
          </Link>
          <Link
            to="/admin/dashboard/offers"
            className={`nav-item ${isActive('offers') ? 'active' : ''}`}
          >
            <FaTags /> Offers
          </Link>
          <Link
            to="/admin/dashboard/categories"
            className={`nav-item ${isActive('categories') ? 'active' : ''}`}
          >
            <FaThList /> Categories
          </Link>
          <Link
            to="/admin/dashboard/floors"
            className={`nav-item ${isActive('floors') ? 'active' : ''}`}
          >
            <FaBuilding /> Floors
          </Link>
        </nav>
      </aside>

      <main className="admin-content">
        <Routes>
          <Route
            index
            element={
              <div className="dashboard-home">
                <h1>Welcome to Admin Dashboard</h1>
                <p>Manage your SuperMall resources from here</p>
                <div className="dashboard-cards">
                  <Link to="shops" className="dashboard-card">
                    <FaStore className="card-icon" />
                    <h3>Shops</h3>
                    <p>Manage shop details and locations</p>
                  </Link>
                  <Link to="products" className="dashboard-card">
                    <FaBox className="card-icon" />
                    <h3>Products</h3>
                    <p>Add and update product information</p>
                  </Link>
                  <Link to="offers" className="dashboard-card">
                    <FaTags className="card-icon" />
                    <h3>Offers</h3>
                    <p>Create and manage special offers</p>
                  </Link>
                  <Link to="categories" className="dashboard-card">
                    <FaThList className="card-icon" />
                    <h3>Categories</h3>
                    <p>Organize products by categories</p>
                  </Link>
                  <Link to="floors" className="dashboard-card">
                    <FaBuilding className="card-icon" />
                    <h3>Floors</h3>
                    <p>Manage mall floor information</p>
                  </Link>
                </div>
              </div>
            }
          />
          <Route path="shops" element={<ShopManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="offers" element={<OfferManagement />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="floors" element={<FloorManagement />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
