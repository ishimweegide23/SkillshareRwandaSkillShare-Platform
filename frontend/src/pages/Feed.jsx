import { useEffect, useState } from 'react';
import { postAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDistanceToNow } from 'date-fns';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await postAPI.getFeed();
      setPosts(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <FullPageLoading />;
  if (error && !refreshing) return <FullPageError message={error} onRetry={handleRefresh} />;

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1 className="feed-title">Your Feed</h1>
        <button 
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="feed-content">
        {posts.length === 0 ? (
          <div className="empty-feed">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h3>No posts yet</h3>
            <p>Be the first to share something!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

// Sub-components for better organization
const FullPageLoading = () => (
  <div className="full-page-center">
    <LoadingSpinner size="large" />
  </div>
);

const FullPageError = ({ message, onRetry }) => (
  <div className="full-page-center">
    <ErrorMessage message={message} />
    <button className="retry-btn" onClick={onRetry}>
      Try Again
    </button>
  </div>
);

const PostCard = ({ post }) => (
  <div className="post-card">
    <div className="post-header">
      <div className="post-author">
        {post.author?.avatar && (
          <img 
            src={post.author.avatar} 
            alt={post.author.name} 
            className="author-avatar"
          />
        )}
        <div>
          <span className="author-name">{post.author?.name || 'Unknown'}</span>
          <span className="post-time">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
    
    <div className="post-body">
      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">{post.content}</p>
      
      {post.images?.length > 0 && (
        <div className="post-images">
          {post.images.slice(0, 3).map((image, index) => (
            <div key={index} className="post-image-container">
              <img 
                src={image.url} 
                alt={`Post ${index + 1}`} 
                className="post-image"
              />
              {index === 2 && post.images.length > 3 && (
                <div className="image-counter">+{post.images.length - 3}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    
    <div className="post-footer">
      <button className="action-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span>Like</span>
      </button>
      <button className="action-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>Comment</span>
      </button>
      <button className="action-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span>Share</span>
      </button>
    </div>
  </div>
);

// CSS Styles
const styles = `
  .feed-container {
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 20px;
    max-width: 800px;
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

  .feed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .feed-title {
    font-size: 28px;
    color: #333;
    margin: 0;
  }

  .refresh-btn {
    padding: 8px 16px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .refresh-btn:hover {
    background-color: #f0f0f0;
  }

  .refresh-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .empty-feed {
    text-align: center;
    padding: 40px 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .empty-feed svg {
    margin-bottom: 16px;
    color: #ccc;
  }

  .empty-feed h3 {
    margin: 8px 0;
    color: #333;
  }

  .empty-feed p {
    color: #666;
    margin: 0;
  }

  .post-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    margin-bottom: 20px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .post-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .post-header {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .post-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .author-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .author-name {
    font-weight: 600;
    color: #333;
    display: block;
  }

  .post-time {
    font-size: 12px;
    color: #888;
  }

  .post-body {
    padding: 16px;
  }

  .post-title {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 18px;
  }

  .post-content {
    margin: 0;
    color: #555;
    line-height: 1.5;
    white-space: pre-line;
  }

  .post-images {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
    margin-top: 12px;
  }

  .post-image-container {
    position: relative;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
  }

  .post-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-counter {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
  }

  .post-footer {
    display: flex;
    border-top: 1px solid #f0f0f0;
    padding: 8px;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    font-size: 14px;
    transition: all 0.2s;
  }

  .action-btn:hover {
    color: #333;
    background-color: #f5f5f5;
    border-radius: 4px;
  }

  .action-btn svg {
    stroke-width: 2;
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
    .feed-container {
      padding: 12px;
    }
    
    .feed-title {
      font-size: 24px;
    }
    
    .post-card {
      border-radius: 8px;
    }
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Feed;