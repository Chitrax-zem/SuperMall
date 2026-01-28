import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaTags, FaClock } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../styles/OfferList.css';

const OfferList = () => {
  const [offers, setOffers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState('');

  const fetchShops = useCallback(async () => {
    try {
      const response = await api.get('/shops');
      setShops(response.data.data || []);
    } catch {
      console.error('Failed to load shops');
    }
  }, []);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ active: 'true' });
      if (selectedShop) params.append('shop', selectedShop);

      const response = await api.get(`/offers?${params.toString()}`);
      setOffers(response.data.data || []);
    } catch {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, [selectedShop]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const getDiscountBadge = (offer) => {
    switch (offer.discountType) {
      case 'percentage':
        return `${offer.discountValue}% OFF`;
      case 'fixed':
        return `$${offer.discountValue} OFF`;
      case 'buy_one_get_one':
        return 'BOGO';
      default:
        return 'SPECIAL OFFER';
    }
  };

  const getDaysRemaining = (validUntil) => {
    if (!validUntil) return null;
    const now = new Date();
    const end = new Date(validUntil);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderRemaining = (validUntil) => {
    const days = getDaysRemaining(validUntil);
    if (days == null) return null;
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} remaining`;
    if (days === 0) return 'Expires today';
    return 'Expired';
  };

  return (
    <div className="offer-list-page">
      <div className="container">
        <div className="page-header">
          <h1>
            <FaTags /> Special Offers
          </h1>
          <select
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
            className="shop-filter"
          >
            <option value="">All Shops</option>
            {shops.map((shop) => (
              <option key={shop._id} value={shop._id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="no-offers">
            <FaTags className="no-offers-icon" />
            <p>No active offers at the moment</p>
          </div>
        ) : (
          <div className="offers-grid">
            {offers.map((offer) => {
              const remainingText = renderRemaining(offer.validUntil);
              const daysLeft = getDaysRemaining(offer.validUntil);
              const isExpiringSoon =
                typeof daysLeft === 'number' && daysLeft <= 3 && daysLeft > 0;

              return (
                <div key={offer._id} className="offer-card">
                  <div className="offer-badge">{getDiscountBadge(offer)}</div>

                  <div className="offer-image">
                    <img
                      src={offer.image || '/placeholder-offer.jpg'}
                      alt={offer.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/placeholder-offer.jpg';
                      }}
                    />
                  </div>

                  <div className="offer-content">
                    <h3>{offer.title}</h3>
                    <p className="offer-description">{offer.description}</p>

                    <div className="offer-shop">
                      <FaStore />
                      <Link to={`/products?shop=${offer.shop?._id || ''}`}>
                        {offer.shop?.name || 'Shop'}
                      </Link>
                    </div>

                    {remainingText && (
                      <div className="offer-validity">
                        <FaClock />
                        <span className={isExpiringSoon ? 'expiring-soon' : ''}>
                          {remainingText}
                        </span>
                      </div>
                    )}

                    {offer.terms && (
                      <details className="offer-terms">
                        <summary>Terms & Conditions</summary>
                        <p>{offer.terms}</p>
                      </details>
                    )}

                    {offer.applicableProducts?.length > 0 && (
                      <Link
                        to={`/products/${offer.applicableProducts[0]._id}`}
                        className="btn btn-primary"
                      >
                        View Products
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferList;
