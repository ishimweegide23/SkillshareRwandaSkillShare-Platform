import { useEffect, useState } from 'react';
import { learningProgressAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { format } from 'date-fns';

const LearningProgress = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'in-progress',
    date: new Date().toISOString().split('T')[0],
    duration: 30
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await learningProgressAPI.getProgress();
      setProgress(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load learning progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProgress = activeFilter === 'all' 
    ? progress 
    : progress.filter(item => item.status === activeFilter);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const res = await learningProgressAPI.createProgress(formData);
      setProgress([...progress, res.data]);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        status: 'in-progress',
        date: new Date().toISOString().split('T')[0],
        duration: 30
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create learning item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const res = await learningProgressAPI.updateProgress(editingItem.id, formData);
      setProgress(progress.map(item => 
        item.id === editingItem.id ? res.data : item
      ));
      setEditingItem(null);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update learning item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this learning item?')) return;
    
    try {
      setLoading(true);
      await learningProgressAPI.deleteProgress(id);
      setProgress(progress.filter(item => item.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete learning item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      status: item.status,
      date: item.date.split('T')[0],
      duration: item.duration || 30
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  if (loading && !progress.length) return <FullPageLoading />;
  if (error && !progress.length) return <FullPageError message={error} />;

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h1 className="progress-title">Learning Progress</h1>
        <div className="progress-actions">
          <div className="progress-filters">
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveFilter('completed')}
            >
              Completed
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'in-progress' ? 'active' : ''}`}
              onClick={() => setActiveFilter('in-progress')}
            >
              In Progress
            </button>
          </div>
          <button 
            className="add-btn"
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
          >
            + Add New
          </button>
        </div>
      </div>

      {showForm && (
        <div className="progress-form-modal">
          <div className="progress-form-container">
            <h2>{editingItem ? 'Edit Learning Item' : 'Add New Learning Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
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
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Duration (mins)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="progress-content">
        {filteredProgress.length === 0 ? (
          <div className="empty-progress">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <h3>No progress updates yet</h3>
            <p>Start learning to track your progress!</p>
            <button 
              className="add-btn"
              onClick={() => setShowForm(true)}
            >
              + Add Your First Item
            </button>
          </div>
        ) : (
          <div className="progress-timeline">
            {filteredProgress.map(item => (
              <ProgressItem 
                key={item.id} 
                item={item} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FullPageLoading = () => (
  <div className="full-page-center">
    <LoadingSpinner size="large" />
  </div>
);

const FullPageError = ({ message }) => (
  <div className="full-page-center">
    <ErrorMessage message={message} />
    <button 
      className="retry-btn"
      onClick={() => window.location.reload()}
    >
      Refresh Page
    </button>
  </div>
);

const ProgressItem = ({ item, onEdit, onDelete }) => (
  <div className={`progress-item ${item.status}`}>
    <div className="progress-dot"></div>
    <div className="progress-content">
      <div className="progress-header">
        <h3 className="progress-title">{item.title}</h3>
        <div className="item-actions">
          <span className={`progress-status ${item.status}`}>
            {item.status === 'completed' ? '✓ Completed' : 'In Progress'}
          </span>
          <button className="edit-btn" onClick={() => onEdit(item)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="delete-btn" onClick={() => onDelete(item.id)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      <p className="progress-description">{item.description}</p>
      <div className="progress-meta">
        <span className="progress-date">
          {format(new Date(item.date), 'MMM d, yyyy')}
        </span>
        {item.duration && (
          <span className="progress-duration">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {item.duration} mins
          </span>
        )}
      </div>
    </div>
  </div>
);

// CSS Styles
const styles = `
  .progress-container {
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
    position: relative;
  }

  .full-page-center {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 20px;
  }

  .progress-header {
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .progress-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .progress-title {
    font-size: 28px;
    color: #333;
    margin: 0;
  }

  .progress-filters {
    display: flex;
    gap: 8px;
  }

  .filter-btn {
    padding: 6px 12px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }

  .filter-btn:hover {
    background-color: #f0f0f0;
  }

  .filter-btn.active {
    background-color: #646cff;
    color: white;
    border-color: #646cff;
  }

  .add-btn {
    padding: 8px 16px;
    background-color: #646cff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .add-btn:hover {
    background-color: #535bf2;
  }

  .progress-form-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
  }

  .progress-form-container {
    background-color: white;
    border-radius: 12px;
    padding: 24px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .progress-form-container h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #333;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #555;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
  }

  .form-group textarea {
    min-height: 100px;
    resize: vertical;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }

  .save-btn {
    padding: 10px 20px;
    background-color: #646cff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }

  .save-btn:hover {
    background-color: #535bf2;
  }

  .save-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .cancel-btn {
    padding: 10px 20px;
    background-color: #f0f0f0;
    color: #333;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }

  .cancel-btn:hover {
    background-color: #e0e0e0;
  }

  .empty-progress {
    text-align: center;
    padding: 40px 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .empty-progress svg {
    margin-bottom: 16px;
    color: #ccc;
  }

  .empty-progress h3 {
    margin: 8px 0;
    color: #333;
  }

  .empty-progress p {
    color: #666;
    margin: 0 0 16px 0;
  }

  .progress-timeline {
    position: relative;
    padding-left: 24px;
  }

  .progress-timeline::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 11px;
    width: 2px;
    background-color: #e0e0e0;
  }

  .progress-item {
    position: relative;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    padding: 20px;
    margin-bottom: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .progress-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .progress-item.completed {
    border-left: 4px solid #4caf50;
  }

  .progress-item.in-progress {
    border-left: 4px solid #2196f3;
  }

  .progress-dot {
    position: absolute;
    left: -30px;
    top: 24px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #fff;
    border: 4px solid #646cff;
    z-index: 1;
  }

  .progress-item.completed .progress-dot {
    border-color: #4caf50;
  }

  .progress-item.in-progress .progress-dot {
    border-color: #2196f3;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .item-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .edit-btn, .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    transition: color 0.2s;
  }

  .edit-btn:hover {
    color: #2196f3;
  }

  .delete-btn:hover {
    color: #f44336;
  }

  .progress-title {
    margin: 0;
    font-size: 18px;
    color: #333;
    flex: 1;
  }

  .progress-status {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 500;
  }

  .progress-status.completed {
    background-color: #e8f5e9;
    color: #4caf50;
  }

  .progress-status.in-progress {
    background-color: #e3f2fd;
    color: #2196f3;
  }

  .progress-description {
    margin: 8px 0;
    color: #555;
    line-height: 1.5;
  }

  .progress-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #888;
  }

  .progress-duration {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .retry-btn {
    margin-top: 16px;
    padding: 10px 20px;
    background-color: #646cff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }

  .retry-btn:hover {
    background-color: #535bf2;
  }

  @media (max-width: 768px) {
    .progress-container {
      padding: 16px;
    }
    
    .progress-title {
      font-size: 24px;
    }
    
    .progress-item {
      padding: 16px;
    }

    .form-row {
      grid-template-columns: 1fr;
    }
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default LearningProgress;