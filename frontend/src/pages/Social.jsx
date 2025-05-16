import { useEffect, useState } from 'react';
import { postAPI, commentAPI, notificationAPI, API_URL } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { 
  Avatar, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Chip, 
  Divider, 
  Grid, 
  IconButton, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  TextField, 
  Typography, 
  Paper,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  CardMedia
} from '@mui/material';
import {
  ThumbUp,
  ThumbUpOutlined,
  ThumbDown,
  ThumbDownOutlined,
  Comment,
  Delete,
  Edit,
  Notifications,
  Close,
  Send
} from '@mui/icons-material';

const Social = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [editingComment, setEditingComment] = useState({ id: null, postId: null, content: '' });
  const [showComments, setShowComments] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await postAPI.getFeed();
      setPosts(res.data.content || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      setCommentLoading(prev => ({ ...prev, [postId]: true }));
      const res = await commentAPI.getComments(postId);
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error('Failed to load comments', err);
      setError('Failed to load comments. Please try again.');
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      setLikeLoading(prev => ({ ...prev, [postId]: true }));
      await postAPI.likePost(postId);
      setLikedPosts(prev => new Set(prev).add(postId));
      fetchData();
    } catch (err) {
      console.error('Failed to like post', err);
      setError('Failed to like post. Please try again.');
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleUnlike = async (postId) => {
    try {
      setLikeLoading(prev => ({ ...prev, [postId]: true }));
      await postAPI.unlikePost(postId);
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      fetchData();
    } catch (err) {
      console.error('Failed to unlike post', err);
      setError('Failed to unlike post. Please try again.');
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentInputs[postId]?.trim()) return;
    
    const tempComment = {
      id: 'temp-' + Date.now(),
      content: commentInputs[postId],
      user: { name: 'You' }, // This will be replaced with actual user data from the server
      createdAt: new Date().toISOString()
    };

    // Optimistically update UI
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), tempComment]
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    try {
      const response = await commentAPI.addComment(postId, commentInputs[postId]);
      // Replace temporary comment with actual one
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].map(comment => 
          comment.id === tempComment.id ? response.data : comment
        )
      }));
    } catch (err) {
      console.error('Failed to add comment', err);
      setError('Failed to add comment. Please try again.');
      // Remove temporary comment on error
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(comment => comment.id !== tempComment.id)
      }));
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment.content?.trim()) return;
    
    const { id, postId, content } = editingComment;
    
    // Optimistically update UI
    setComments(prev => ({
      ...prev,
      [postId]: prev[postId].map(comment => 
        comment.id === id ? { ...comment, content } : comment
      )
    }));
    setEditingComment({ id: null, postId: null, content: '' });

    try {
      await commentAPI.updateComment(id, content);
      // No need to update UI again as we already did it optimistically
    } catch (err) {
      console.error('Failed to update comment', err);
      setError('Failed to update comment. Please try again.');
      // Revert optimistic update on error
      fetchComments(postId);
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    // Optimistically update UI
    setComments(prev => ({
      ...prev,
      [postId]: prev[postId].filter(comment => comment.id !== commentId)
    }));

    try {
      await commentAPI.deleteComment(commentId);
      // No need to update UI again as we already did it optimistically
    } catch (err) {
      console.error('Failed to delete comment', err);
      setError('Failed to delete comment. Please try again.');
      // Revert optimistic update on error
      fetchComments(postId);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    if (!comments[postId] && !showComments[postId]) {
      fetchComments(postId);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorMessage message={error} fullScreen />;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      padding: { xs: 2, md: 4 }
    }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={10} lg={8}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3
          }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Social Feed
            </Typography>
            <Badge 
              badgeContent={notifications.filter(n => !n.read).length} 
              color="error"
              overlap="circular"
            >
              <IconButton 
                color="inherit" 
                onClick={() => setOpenNotifications(true)}
                sx={{ backgroundColor: 'primary.main', color: 'white' }}
              >
                <Notifications />
              </IconButton>
            </Badge>
          </Box>

          <Dialog 
            open={openNotifications} 
            onClose={() => setOpenNotifications(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Notifications</Typography>
                <IconButton onClick={() => setOpenNotifications(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <List>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <ListItem 
                      key={n.id} 
                      sx={{ 
                        backgroundColor: n.read ? 'inherit' : '#f5f5f5',
                        borderRadius: 1,
                        mb: 1
                      }}
                      secondaryAction={
                        !n.read && (
                          <Button 
                            size="small" 
                            onClick={() => markNotificationAsRead(n.id)}
                          >
                            Mark as read
                          </Button>
                        )
                      }
                    >
                      <ListItemText
                        primary={n.message}
                        secondary={new Date(n.createdAt).toLocaleString()}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body1" color="textSecondary" sx={{ p: 2 }}>
                    No notifications yet
                  </Typography>
                )}
              </List>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setOpenNotifications(false)}
                color="primary"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {posts.length === 0 && !loading && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No posts available. Be the first to create one!
              </Typography>
            </Paper>
          )}

          {posts.map((post) => (
            <Card key={post.id} sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ mr: 2 }}>
                    {post.user?.name?.charAt(0) || 'U'}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {post.user?.name || 'Unknown User'}
                  </Typography>
                </Box>
                
                <Typography variant="body1" paragraph>
                  {post.description}
                </Typography>
                
                {post.imageUrls?.length > 0 && (
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 2,
                    mt: 2
                  }}>
                    {post.imageUrls.map((url, i) => (
                      <CardMedia
                        key={i}
                        component="img"
                        image={url.startsWith('http') ? url : `${API_URL}${url}`}
                        alt={`Post image ${i}`}
                        sx={{ 
                          borderRadius: 2,
                          maxHeight: 300,
                          objectFit: 'cover'
                        }}
                        onError={e => { e.target.src = '/fallback.png'; }}
                      />
                    ))}
                  </Box>
                )}
                
                <Typography variant="caption" color="textSecondary">
                  Posted on {new Date(post.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ px: 2, pt: 0 }}>
                <Box display="flex" alignItems="center" flexGrow={1}>
                  <IconButton 
                    onClick={() => likedPosts.has(post.id) ? handleUnlike(post.id) : handleLike(post.id)}
                    color={likedPosts.has(post.id) ? 'primary' : 'default'}
                    disabled={likeLoading[post.id]}
                  >
                    {likeLoading[post.id] ? (
                      <CircularProgress size={24} />
                    ) : likedPosts.has(post.id) ? (
                      <ThumbUp />
                    ) : (
                      <ThumbUpOutlined />
                    )}
                  </IconButton>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {post.likes || 0}
                  </Typography>
                  
                  <IconButton onClick={() => toggleComments(post.id)}>
                    <Comment color={showComments[post.id] ? 'primary' : 'inherit'} />
                  </IconButton>
                  <Typography variant="body2">
                    {(comments[post.id]?.length || 0) + (showComments[post.id] ? '' : ' comments')}
                  </Typography>
                </Box>
              </CardActions>
              
              {showComments[post.id] && (
                <Box sx={{ px: 2, pb: 2 }}>
                  <Divider sx={{ mb: 2 }} />
                  
                  {commentLoading[post.id] ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : comments[post.id]?.length > 0 ? (
                    <List sx={{ mb: 2 }}>
                      {comments[post.id].map((comment) => (
                        <ListItem 
                          key={comment.id} 
                          sx={{ 
                            alignItems: 'flex-start',
                            backgroundColor: '#f9f9f9',
                            borderRadius: 1,
                            mb: 1
                          }}
                          secondaryAction={
                            <Box>
                              <IconButton 
                                onClick={() => setEditingComment({
                                  id: comment.id,
                                  postId: post.id,
                                  content: comment.content
                                })}
                                size="small"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton 
                                onClick={() => handleDeleteComment(comment.id, post.id)}
                                size="small"
                              >
                                <Delete fontSize="small" color="error" />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {comment.user?.name?.charAt(0) || 'U'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" component="span">
                                {comment.user?.name || 'Unknown User'}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.primary">
                                {comment.content}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      No comments yet
                    </Typography>
                  )}
                  
                  <Box display="flex" alignItems="center">
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      sx={{ mr: 1 }}
                    />
                    <IconButton 
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentInputs[post.id]?.trim()}
                      color="primary"
                    >
                      <Send />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Card>
          ))}
        </Grid>
      </Grid>

      {/* Edit Comment Dialog */}
      <Dialog 
        open={Boolean(editingComment.id)} 
        onClose={() => setEditingComment({ id: null, postId: null, content: '' })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editingComment.content}
            onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditingComment({ id: null, postId: null, content: '' })}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateComment}
            color="primary"
            disabled={!editingComment.content?.trim()}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Social;