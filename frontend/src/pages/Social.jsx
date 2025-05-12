import { useEffect, useState } from 'react';
import { postAPI, commentAPI, notificationAPI } from '../services/api';
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
  DialogActions
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

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await postAPI.getFeed();
      setPosts(res.data.data || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await commentAPI.getComments(postId);
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error('Failed to load comments', err);
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
      await postAPI.likePost(postId);
      fetchData();
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      await postAPI.unlikePost(postId);
      fetchData();
    } catch (err) {
      console.error('Failed to unlike post', err);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentInputs[postId]?.trim()) return;
    try {
      await commentAPI.addComment(postId, commentInputs[postId]);
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      fetchComments(postId);
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment.content?.trim()) return;
    try {
      await commentAPI.updateComment(editingComment.id, editingComment.content);
      fetchComments(editingComment.postId);
      setEditingComment({ id: null, postId: null, content: '' });
    } catch (err) {
      console.error('Failed to update comment', err);
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    try {
      await commentAPI.deleteComment(commentId);
      fetchComments(postId);
    } catch (err) {
      console.error('Failed to delete comment', err);
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
                
                <Typography variant="caption" color="textSecondary">
                  Posted on {new Date(post.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ px: 2, pt: 0 }}>
                <Box display="flex" alignItems="center" flexGrow={1}>
                  <IconButton 
                    onClick={() => post.isLiked ? handleUnlike(post.id) : handleLike(post.id)}
                    color={post.isLiked ? 'primary' : 'default'}
                  >
                    {post.isLiked ? <ThumbUp /> : <ThumbUpOutlined />}
                  </IconButton>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {post.likedBy?.length || 0}
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
                  
                  {comments[post.id]?.length > 0 ? (
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