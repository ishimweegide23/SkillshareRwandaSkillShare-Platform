import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { feedAPI } from '../services/api';

const categories = [
  { name: 'IT', image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=200' },
  { name: 'Music', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200' },
  { name: 'Programming', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200' },
  { name: 'Art', image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=200' },
  { name: 'Business', image: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?w=200' },
  { name: 'Other', image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=200' }
];

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '' });
  const [editPost, setEditPost] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [editComment, setEditComment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const loadPosts = async () => {
    try {
      let response;
      if (selectedCategory === 'all') {
        response = await feedAPI.getAllPosts();
      } else {
        response = await feedAPI.getPostsByCategory(selectedCategory);
      }
      setPosts(response.data);
      // Load comments for each post
      response.data.forEach(post => loadComments(post.id));
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadComments = async (postId) => {
    try {
      const response = await feedAPI.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: response.data }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleCreatePost = async () => {
    try {
      await feedAPI.createPost(newPost);
      setNewPost({ title: '', content: '', category: '' });
      setOpenDialog(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleUpdatePost = async () => {
    try {
      await feedAPI.updatePost(editPost.id, editPost);
      setEditPost(null);
      loadPosts();
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await feedAPI.deletePost(postId);
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await feedAPI.likePost(postId);
      loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    try {
      await feedAPI.addComment(postId, { content: newComment[postId] });
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      loadComments(postId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateComment = async (postId, commentId) => {
    try {
      await feedAPI.updateComment(postId, commentId, { content: editComment.content });
      setEditComment(null);
      loadComments(postId);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await feedAPI.deleteComment(postId, commentId);
      loadComments(postId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      <Container maxWidth="lg" sx={{ 
        flexGrow: 1, 
        py: 4,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
          }}>
            <Typography variant="h4" component="h1">
              Community Feed
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ height: 'fit-content' }}
            >
              Create Feed
            </Button>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            mb: 2,
            flexWrap: 'wrap',
          }}>
            <Chip
              label="All"
              onClick={() => setSelectedCategory('all')}
              color={selectedCategory === 'all' ? 'primary' : 'default'}
              sx={{ mb: 1 }}
            />
            {categories.map((category) => (
              <Chip
                key={category.name}
                label={category.name}
                onClick={() => setSelectedCategory(category.name)}
                color={selectedCategory === category.name ? 'primary' : 'default'}
                avatar={<Avatar src={category.image} />}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        </Paper>

        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          {posts.map((post) => (
            <Grid item xs={12} key={post.id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 6,
                }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2 
                  }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                      {post.title}
                    </Typography>
                    <Chip 
                      label={post.category} 
                      color="primary" 
                      size="small" 
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                    {post.content}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 2,
                    flexWrap: 'wrap',
                  }}>
                    <Button
                      startIcon={<ThumbUpIcon />}
                      onClick={() => handleLikePost(post.id)}
                      sx={{ minWidth: '100px' }}
                    >
                      {post.likes} Likes
                    </Button>
                    <Button
                      startIcon={<CommentIcon />}
                      onClick={() => {
                        setSelectedPost(post);
                        setOpenCommentDialog(true);
                      }}
                      sx={{ minWidth: '120px' }}
                    >
                      {comments[post.id]?.length || 0} Comments
                    </Button>
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                      <IconButton 
                        onClick={() => setEditPost(post)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeletePost(post.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Posted on {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Create/Edit Post Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setEditPost(null);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editPost ? 'Edit Post' : 'Create New Feed'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={editPost ? editPost.title : newPost.title}
              onChange={(e) => editPost ? setEditPost({ ...editPost, title: e.target.value }) : setNewPost({ ...newPost, title: e.target.value })}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={6}
              value={editPost ? editPost.content : newPost.content}
              onChange={(e) => editPost ? setEditPost({ ...editPost, content: e.target.value }) : setNewPost({ ...newPost, content: e.target.value })}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              select
              label="Category"
              value={editPost ? editPost.category : newPost.category}
              onChange={(e) => editPost ? setEditPost({ ...editPost, category: e.target.value }) : setNewPost({ ...newPost, category: e.target.value })}
              margin="normal"
              variant="outlined"
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setEditPost(null);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={editPost ? handleUpdatePost : handleCreatePost}
            variant="contained"
            color="primary"
            sx={{ ml: 2 }}
          >
            {editPost ? 'Update Feed' : 'Create Feed'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog
        open={openCommentDialog}
        onClose={() => {
          setOpenCommentDialog(false);
          setEditComment(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>
          Comments - {selectedPost?.title}
        </DialogTitle>
        <DialogContent dividers sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <Box sx={{ 
            overflowY: 'auto', 
            flexGrow: 1,
            mb: 2,
          }}>
            {comments[selectedPost?.id]?.length > 0 ? (
              <List>
                {comments[selectedPost?.id]?.map((comment) => (
                  <React.Fragment key={comment.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                            {comment.content}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        {editComment?.id === comment.id ? (
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                              size="small"
                              value={editComment.content}
                              onChange={(e) => setEditComment({ ...editComment, content: e.target.value })}
                              sx={{ width: '300px' }}
                            />
                            <IconButton 
                              onClick={() => handleUpdateComment(selectedPost.id, comment.id)}
                              color="primary"
                            >
                              <SendIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box>
                            <IconButton 
                              onClick={() => setEditComment(comment)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleDeleteComment(selectedPost.id, comment.id)}
                              size="small"
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100px',
              }}>
                <Typography variant="body1" color="text.secondary">
                  No comments yet. Be the first to comment!
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            pt: 2,
            borderTop: '1px solid #eee',
          }}>
            <TextField
              fullWidth
              size="medium"
              placeholder="Add a comment..."
              value={newComment[selectedPost?.id] || ''}
              onChange={(e) => setNewComment({ ...newComment, [selectedPost.id]: e.target.value })}
              variant="outlined"
            />
            <IconButton
              color="primary"
              onClick={() => handleAddComment(selectedPost.id)}
              size="large"
              disabled={!newComment[selectedPost?.id]?.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenCommentDialog(false)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Feed;