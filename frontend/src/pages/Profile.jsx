import { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getProfile();
        setProfile(res.data);
        setFormData({
          name: res.data.name,
          email: res.data.email,
          bio: res.data.bio || '',
          location: res.data.location || ''
        });
        setError(null);
      } catch (err) {
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await userAPI.updateProfile(formData);
      setProfile(res.data);
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) return <FullPageLoading />;
  if (error && !profile) return <FullPageError message={error} />;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">Your Profile</h1>
        <button 
          className={`edit-btn ${editMode ? 'cancel' : ''}`}
          onClick={() => setEditMode(!editMode)}
          disabled={loading}
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            <img 
              src={profile?.avatar || 'https://via.placeholder.com/150'} 
              alt="Profile" 
              className="profile-avatar"
            />
            {editMode && (
              <button className="avatar-upload-btn">
                Change Photo
                <input type="file" accept="image/*" style={{ display: 'none' }} />
              </button>
            )}
          </div>
          
          {!editMode && profile?.joinedDate && (
            <div className="member-since">
              Member since {new Date(profile.joinedDate).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="profile-details">
          {editMode ? (
            <form className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled // Typically email shouldn't be editable
                />
              </div>
              
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Where are you based?"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="save-btn"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-info">
                <h2 className="profile-name">{profile?.name}</h2>
                <div className="profile-email">{profile?.email}</div>
                
                {profile?.bio && (
                  <div className="profile-bio">
                    <h4>About</h4>
                    <p>{profile.bio}</p>
                  </div>
                )}
                
                {profile?.location && (
                  <div className="profile-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {profile.location}
                  </div>
                )}
              </div>
              
              <div className="profile-stats">
                <div className="stat-item">
                  <div className="stat-value">{profile?.coursesCompleted || 0}</div>
                  <div className="stat-label">Courses Completed</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{profile?.hoursLearned || 0}</div>
                  <div className="stat-label">Hours Learned</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{profile?.currentStreak || 0}</div>
                  <div className="stat-label">Day Streak</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

// Sub-components
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

// CSS Styles
const styles = `
  .profile-container {
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 24px;
    max-width: 900px;
    margin: 0 auto;
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

  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .profile-title {
    font-size: 28px;
    color: #333;
    margin: 0;
  }

  .edit-btn {
    padding: 8px 16px;
    background-color: #646cff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
  }

  .edit-btn:hover {
    background-color: #535bf2;
  }

  .edit-btn.cancel {
    background-color: #ff4444;
  }

  .edit-btn.cancel:hover {
    background-color: #cc0000;
  }

  .edit-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .profile-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    .profile-card {
      flex-direction: row;
    }
  }

  .profile-avatar-section {
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f5f7ff;
    min-width: 250px;
  }

  .avatar-wrapper {
    position: relative;
    margin-bottom: 16px;
    text-align: center;
  }

  .profile-avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .avatar-upload-btn {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    background-color: rgba(0,0,0,0.7);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .avatar-upload-btn:hover {
    background-color: rgba(0,0,0,0.9);
  }

  .member-since {
    font-size: 13px;
    color: #666;
    margin-top: 8px;
  }

  .profile-details {
    padding: 32px;
    flex: 1;
  }

  .profile-info {
    margin-bottom: 24px;
  }

  .profile-name {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 24px;
  }

  .profile-email {
    color: #666;
    margin-bottom: 16px;
  }

  .profile-bio h4 {
    margin: 16px 0 8px 0;
    color: #444;
    font-size: 16px;
  }

  .profile-bio p {
    margin: 0;
    color: #555;
    line-height: 1.5;
  }

  .profile-location {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 16px;
    color: #666;
    font-size: 14px;
  }

  .profile-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #eee;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: #646cff;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 13px;
    color: #666;
  }

  .profile-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group label {
    font-size: 14px;
    color: #555;
    font-weight: 500;
  }

  .form-group input,
  .form-group textarea {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 15px;
    transition: all 0.3s;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #646cff;
    box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 80px;
  }

  .form-actions {
    margin-top: 16px;
  }

  .save-btn {
    padding: 10px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }

  .save-btn:hover {
    background-color: #3d8b40;
  }

  .save-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
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
    .profile-container {
      padding: 16px;
    }
    
    .profile-title {
      font-size: 24px;
    }
    
    .profile-avatar-section {
      padding: 24px;
    }
    
    .profile-avatar {
      width: 120px;
      height: 120px;
    }
    
    .profile-details {
      padding: 24px;
    }
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Profile;