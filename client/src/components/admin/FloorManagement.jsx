import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import '../styles/Management.css';

const FloorManagement = () => {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [formData, setFormData] = useState({
    floorNumber: '',
    name: '',
    description: '',
    totalShops: '',
    amenities: [],
    isActive: true,
  });

  useEffect(() => {
    fetchFloors();
  }, []);

  const fetchFloors = async () => {
    try {
      const response = await api.get('/floors');
      setFloors(response.data.data);
    } catch {
      toast.error('Failed to load floors');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAmenitiesChange = (e) => {
    const amenities = e.target.value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item);
    setFormData({ ...formData, amenities });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        floorNumber: parseInt(formData.floorNumber, 10),
        totalShops: parseInt(formData.totalShops, 10) || 0,
      };

      if (editingFloor) {
        await api.put(`/floors/${editingFloor._id}`, submitData);
        toast.success('Floor updated successfully');
      } else {
        await api.post('/floors', submitData);
        toast.success('Floor created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchFloors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (floor) => {
    setEditingFloor(floor);
    setFormData({
      floorNumber: floor.floorNumber || '',
      name: floor.name || '',
      description: floor.description || '',
      totalShops: floor.totalShops || '',
      amenities: floor.amenities || [],
      isActive: floor.isActive !== undefined ? floor.isActive : true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this floor?')) return;

    try {
      await api.delete(`/floors/${id}`);
      toast.success('Floor deleted successfully');
      fetchFloors();
    } catch {
      toast.error('Failed to delete floor');
    }
  };

  const resetForm = () => {
    setFormData({
      floorNumber: '',
      name: '',
      description: '',
      totalShops: '',
      amenities: [],
      isActive: true,
    });
    setEditingFloor(null);
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
        <h2>Floor Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <FaPlus /> Add Floor
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Floor Number</th>
              <th>Name</th>
              <th>Total Shops</th>
              <th>Occupied Shops</th>
              <th>Amenities</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {floors.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No floors found
                </td>
              </tr>
            ) : (
              floors.map((floor) => (
                <tr key={floor._id}>
                  <td>
                    <strong>Floor {floor.floorNumber}</strong>
                  </td>
                  <td>{floor.name}</td>
                  <td>{floor.totalShops || 0}</td>
                  <td>{floor.occupiedShops || 0}</td>
                  <td>
                    {floor.amenities && floor.amenities.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {floor.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={`${amenity}-${index}`} className="amenity-tag">
                            {amenity}
                          </span>
                        ))}
                        {floor.amenities.length > 3 && (
                          <span className="amenity-tag">
                            +{floor.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        floor.isActive ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      {floor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => handleEdit(floor)}
                      className="btn-icon btn-edit"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(floor._id)}
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
              <h3>{editingFloor ? 'Edit Floor' : 'Add Floor'}</h3>
              <button onClick={handleCloseModal} className="btn-close">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Floor Number *</label>
                  <input
                    type="number"
                    name="floorNumber"
                    value={formData.floorNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 1, 2, 3"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Floor Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Ground Floor, First Floor"
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
                  placeholder="Brief description of the floor"
                />
              </div>

              <div className="form-group">
                <label>Total Shop Capacity</label>
                <input
                  type="number"
                  name="totalShops"
                  value={formData.totalShops}
                  onChange={handleInputChange}
                  placeholder="Total number of shops on this floor"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Amenities (comma-separated)</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities.join(', ')}
                  onChange={handleAmenitiesChange}
                  placeholder="e.g., Parking, Restrooms, Food Court, Elevators"
                />
                <small>Enter amenities separated by commas</small>
              </div>

              {formData.amenities.length > 0 && (
                <div className="form-group">
                  <label>Preview:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                    {formData.amenities.map((amenity, index) => (
                      <span key={`${amenity}-${index}`} className="amenity-tag">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active Floor
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFloor ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloorManagement;
