import { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../styles/Management.css';

const OfferManagement = () => {
  const [offers, setOffers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shop: '',
    discountType: 'percentage',
    discountValue: '',
    validFrom: '',
    validUntil: '',
    terms: '',
    isActive: true,
  });

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/offers?limit=100');
      setOffers(response.data.data || []);
    } catch {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchOffers();
    fetchShops();
  }, [fetchOffers, fetchShops]);

  const handleOpenModal = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      shop: '',
      discountType: 'percentage',
      discountValue: '',
      validFrom: '',
      validUntil: '',
      terms: '',
      isActive: true,
    });
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title || '',
      description: offer.description || '',
      shop: offer.shop?._id || '',
      discountType: offer.discountType || 'percentage',
      discountValue: offer.discountValue ?? '',
      validFrom: offer.validFrom ? offer.validFrom.slice(0, 10) : '',
      validUntil: offer.validUntil ? offer.validUntil.slice(0, 10) : '',
      terms: offer.terms || '',
      isActive: offer.isActive !== undefined ? offer.isActive : true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/offers/${id}`);
      toast.success('Offer deleted successfully');
      fetchOffers();
    } catch {
      toast.error('Failed to delete offer');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((s) => ({
      ...s,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOffer) {
        await api.put(`/offers/${editingOffer._id}`, formData);
        toast.success('Offer updated successfully');
      } else {
        await api.post('/offers', formData);
        toast.success('Offer created successfully');
      }
      handleCloseModal();
      fetchOffers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Offer Management</h2>
        <button onClick={handleOpenModal} className="btn btn-primary">
          <FaPlus /> Add Offer
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading offers...</div>
        ) : offers.length === 0 ? (
          <div className="no-data">No offers found</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Shop</th>
                <th>Type</th>
                <th>Value</th>
                <th>Valid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer._id}>
                  <td>{offer.title}</td>
                  <td>{offer.shop?.name || '-'}</td>
                  <td>{offer.discountType}</td>
                  <td>
                    {offer.discountType === 'percentage'
                      ? `${offer.discountValue}%`
                      : offer.discountType === 'fixed'
                      ? `$${offer.discountValue}`
                      : 'BOGO'}
                  </td>
                  <td>
                    {offer.validFrom ? new Date(offer.validFrom).toLocaleDateString() : '-'} to{' '}
                    {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : '-'}
                  </td>
                  <td>{offer.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleEdit(offer)}
                      className="btn-icon btn-edit"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(offer._id)}
                      className="btn-icon btn-delete"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingOffer ? 'Edit Offer' : 'Add Offer'}</h3>
              <button onClick={handleCloseModal} className="btn-close">×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Shop *</label>
                <select
                  name="shop"
                  value={formData.shop}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Shop</option>
                  {shops.map((shop) => (
                    <option key={shop._id} value={shop._id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount Type</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                    <option value="buy_one_get_one">Buy One Get One</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount Value</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valid From</label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Valid Until</label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Terms</label>
                <textarea
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  rows="2"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active Offer
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingOffer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferManagement;
