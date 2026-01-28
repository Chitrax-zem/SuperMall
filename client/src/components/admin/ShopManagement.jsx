import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../styles/Management.css';

const ShopManagement = () => {
  const [shops, setShops] = useState([]);
  const [floors, setFloors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner: {
      name: '',
      email: '',
      phone: '',
    },
    location: {
      floor: '',
      shopNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        pincode: '',
      },
    },
    categories: [],
    contactInfo: {
      phone: '',
      email: '',
      website: '',
    },
  });

  useEffect(() => {
    fetchShops();
    fetchFloors();
    fetchCategories();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await api.get('/shops?limit=100');
      setShops(response.data.data);
    } catch {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const fetchFloors = async () => {
    try {
      const response = await api.get('/floors');
      setFloors(response.data.data);
    } catch {
      console.error('Failed to load floors');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch {
      console.error('Failed to load categories');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData((prev) => {
        const updated = { ...prev };
        let current = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData({ ...formData, categories: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingShop) {
        await api.put(`/shops/${editingShop._id}`, formData);
        toast.success('Shop updated successfully');
      } else {
        await api.post('/shops', formData);
        toast.success('Shop created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchShops();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name || '',
      description: shop.description || '',
      owner: {
        name: shop.owner?.name || '',
        email: shop.owner?.email || '',
        phone: shop.owner?.phone || '',
      },
      location: {
        floor: shop.location?.floor?._id || '',
        shopNumber: shop.location?.shopNumber || '',
        address: {
          street: shop.location?.address?.street || '',
          city: shop.location?.address?.city || '',
          state: shop.location?.address?.state || '',
          country: shop.location?.address?.country || '',
          pincode: shop.location?.address?.pincode || '',
        },
      },
      categories: shop.categories?.map((cat) => cat._id) || [],
      contactInfo: {
        phone: shop.contactInfo?.phone || '',
        email: shop.contactInfo?.email || '',
        website: shop.contactInfo?.website || '',
      },
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shop?')) return;

    try {
      await api.delete(`/shops/${id}`);
      toast.success('Shop deleted successfully');
      fetchShops();
    } catch {
      toast.error('Failed to delete shop');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      owner: {
        name: '',
        email: '',
        phone: '',
      },
      location: {
        floor: '',
        shopNumber: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          pincode: '',
        },
      },
      categories: [],
      contactInfo: {
        phone: '',
        email: '',
        website: '',
      },
    });
    setEditingShop(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Shop Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <FaPlus /> Add Shop
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Owner</th>
              <th>Floor</th>
              <th>Shop Number</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shops.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No shops found
                </td>
              </tr>
            ) : (
              shops.map((shop) => (
                <tr key={shop._id}>
                  <td>{shop.name}</td>
                  <td>{shop.owner?.name}</td>
                  <td>Floor {shop.location?.floor?.floorNumber}</td>
                  <td>{shop.location?.shopNumber}</td>
                  <td>{shop.contactInfo?.phone || shop.owner?.phone}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleEdit(shop)}
                      className="btn-icon btn-edit"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(shop._id)}
                      className="btn-icon btn-delete"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingShop ? 'Edit Shop' : 'Add Shop'}</h3>
              <button onClick={handleCloseModal} className="btn-close">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Shop Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Shop Number *</label>
                  <input
                    type="text"
                    name="location.shopNumber"
                    value={formData.location.shopNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
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

              <h4>Owner Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Owner Name *</label>
                  <input
                    type="text"
                    name="owner.name"
                    value={formData.owner.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Owner Email *</label>
                  <input
                    type="email"
                    name="owner.email"
                    value={formData.owner.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Owner Phone *</label>
                <input
                  type="tel"
                  name="owner.phone"
                  value={formData.owner.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <h4>Location</h4>
              <div className="form-group">
                <label>Floor *</label>
                <select
                  name="location.floor"
                  value={formData.location.floor}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Floor</option>
                  {floors.map((floor) => (
                    <option key={floor._id} value={floor._id}>
                      Floor {floor.floorNumber} - {floor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Street</label>
                  <input
                    type="text"
                    name="location.address.street"
                    value={formData.location.address.street}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="location.address.city"
                    value={formData.location.address.city}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="location.address.state"
                    value={formData.location.address.state}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="location.address.country"
                    value={formData.location.address.country}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="location.address.pincode"
                    value={formData.location.address.pincode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <h4>Categories</h4>
              <div className="form-group">
                <label>Select Categories</label>
                <select
                  multiple
                  value={formData.categories}
                  onChange={handleCategoryChange}
                  className="multi-select"
                  size="5"
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <small>Hold Ctrl/Cmd to select multiple</small>
              </div>

              <h4>Contact Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="contactInfo.phone"
                    value={formData.contactInfo.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="contactInfo.email"
                    value={formData.contactInfo.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="contactInfo.website"
                  value={formData.contactInfo.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingShop ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopManagement;
