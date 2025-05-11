import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CreatePost = () => {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const MAX_CHARS = 500;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Create preview URLs
    const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const removeImage = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await postAPI.createPostWithImages(description, files);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const charsRemaining = MAX_CHARS - description.length;

  return (
    <div className="create-post-container">
      <div className="create-post-card">
        <h2 className="create-post-title">Create Post</h2>
        
        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <textarea
              name="description"
              placeholder="What's on your mind?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={MAX_CHARS}
              className="post-textarea"
            />
            <div className={`char-counter ${charsRemaining < 50 ? 'warning' : ''}`}>
              {charsRemaining} characters remaining
            </div>
          </div>

          <div className="file-upload-section">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            
            <button 
              type="button" 
              className="upload-btn"
              onClick={() => fileInputRef.current.click()}
            >
              {files.length > 0 ? 'Add more images' : 'Upload images'}
            </button>
            
            {files.length > 0 && (
              <span className="file-count">{files.length} file(s) selected</span>
            )}
          </div>

          {previews.length > 0 && (
            <div className="image-previews">
              {previews.map((preview, index) => (
                <div key={index} className="image-preview-container">
                  <img 
                    src={preview} 
                    alt={`Preview ${index}`} 
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading || !description.trim()}
          >
            {loading ? (
              <>
                <LoadingSpinner small /> Posting...
              </>
            ) : (
              'Create Post'
            )}
          </button>
        </form>
        
        {error && <ErrorMessage message={error} />}
      </div>
    </div>
  );
};

// CSS Styles (can be in a separate file or CSS-in-JS)
const styles = `
  .create-post-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 64px);
    padding: 20px;
    background-color: #f5f5f5;
  }

  .create-post-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    padding: 32px;
    width: 100%;
    max-width: 500px;
    transition: all 0.3s ease;
  }

  .create-post-title {
    margin: 0 0 24px 0;
    color: #333;
    text-align: center;
    font-size: 24px;
  }

  .create-post-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-group {
    position: relative;
  }

  .post-textarea {
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    resize: vertical;
    transition: border-color 0.3s;
  }

  .post-textarea:focus {
    outline: none;
    border-color: #646cff;
    box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
  }

  .char-counter {
    text-align: right;
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }

  .char-counter.warning {
    color: #ff6b6b;
  }

  .file-upload-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .upload-btn {
    padding: 8px 16px;
    background-color: #f0f0f0;
    border: 1px dashed #ccc;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .upload-btn:hover {
    background-color: #e9e9e9;
    border-color: #999;
  }

  .file-count {
    font-size: 14px;
    color: #666;
  }

  .image-previews {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
    margin-top: 10px;
  }

  .image-preview-container {
    position: relative;
    aspect-ratio: 1;
  }

  .image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #eee;
  }

  .remove-image-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: all 0.2s;
  }

  .remove-image-btn:hover {
    background: #cc0000;
    transform: scale(1.1);
  }

  .submit-btn {
    padding: 12px;
    background-color: #646cff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .submit-btn:hover {
    background-color: #535bf2;
  }

  .submit-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default CreatePost;