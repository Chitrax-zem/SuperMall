import { Link } from 'react-router-dom';
import { FaStore, FaShoppingBag, FaTags, FaBuilding, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import '../styles/Header.css';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <FaStore className="logo-icon" />
            <span>SuperMall</span>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">
              <FaBuilding />
              Home
            </Link>
            <Link to="/products" className="nav-link">
              <FaShoppingBag />
              Products
            </Link>
            <Link to="/shops" className="nav-link">
              <FaStore />
              Shops
            </Link>
            <Link to="/offers" className="nav-link">
              <FaTags />
              Offers
            </Link>
            
            {isAuthenticated ? (
              <div className="admin-menu">
                <Link to="/admin/dashboard" className="nav-link admin-link">
                  <FaUserShield />
                  Admin
                </Link>
                <button onClick={logout} className="btn-logout">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/admin/login" className="nav-link admin-link">
                <FaUserShield />
                Admin Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
