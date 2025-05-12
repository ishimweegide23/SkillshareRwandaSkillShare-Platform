import { useEffect, useState } from 'react';
import { postAPI, commentAPI, notificationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Social = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await postAPI.getFeed();
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    const res = await commentAPI.getComments(postId);
    setComments((prev) => ({ ...prev, [postId]: res.data }));
  };

  const fetchNotifications = async () => {
    const res = await notificationAPI.getNotifications();
    setNotifications(res.data);
  };

  const handleLike = async (postId) => {
    await postAPI.likePost(postId);
    fetchData();
  };

  const handleUnlike = async (postId) => {
    await postAPI.unlikePost(postId);
    fetchData();
  };

  const handleAddComment = async (postId) => {
    if (!commentInputs[postId]) return;
    await commentAPI.addComment(postId, commentInputs[postId]);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    fetchComments(postId);
  };

  const handleUpdateComment = async (commentId, postId, content) => {
    if (!content) return;
    await commentAPI.updateComment(commentId, content);
    fetchComments(postId);
  };

  const handleDeleteComment = async (commentId, postId) => {
    await commentAPI.deleteComment(commentId);
    fetchComments(postId);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <h2>Social Feed</h2>
      <div style={{ marginBottom: 32 }}>
        <h3>Notifications</h3>
        <ul>
          {notifications.map((n) => (
            <li key={n.id}>{n.message} {n.read ? '' : <b>(unread)</b>}</li>
          ))}
        </ul>
      </div>
      {posts.map((post) => (
        <div key={post.id} style={{ border: '1px solid #eee', borderRadius: 6, background: '#fafbfc', padding: 16, marginBottom: 16 }}>
          <div><b>{post.description}</b></div>
          <div>
            <button onClick={() => handleLike(post.id)}>Like</button>
            <button onClick={() => handleUnlike(post.id)}>Unlike</button>
            <span> {post.likedBy?.length || 0} likes</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => fetchComments(post.id)}>Show Comments</button>
            <ul>
              {(comments[post.id] || []).map((c) => (
                <li key={c.id}>
                  {c.content}
                  <button onClick={() => {
                    const newContent = prompt('Edit comment:', c.content);
                    if (newContent !== null) handleUpdateComment(c.id, post.id, newContent);
                  }}>Edit</button>
                  <button onClick={() => handleDeleteComment(c.id, post.id)}>Delete</button>
                </li>
              ))}
            </ul>
            <input
              value={commentInputs[post.id] || ''}
              onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
              placeholder="Add a comment"
            />
            <button onClick={() => handleAddComment(post.id)}>Add</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Social; 