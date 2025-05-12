import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAPI, API_URL } from '../services/api';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Tooltip
} from '@mui/material';
import {
  AddPhotoAlternate,
  Close,
  Delete,
  Edit,
  Send,
  Image,
  Warning
} from '@mui/icons-material';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MAX_CHARS = 500;

const CreatePost = () => {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await postAPI.getFeed();
      setPosts(res.data.content || []);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    
    setFiles(prev => [...prev, ...selectedFiles]);
    
    // Create preview URLs
    const previewUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...previewUrls]);
  };

  const removeImage = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index]);
    
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
      if (editingPost) {
        // Update existing post
        await postAPI.updatePost(editingPost.id, { description, files });
      } else {
        // Create new post
        await postAPI.createPostWithImages(description, files);
      }
      
      // Clear form and fetch updated posts
      setDescription('');
      setFiles([]);
      setPreviews([]);
      setEditingPost(null);
      await fetchPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      setLoading(true);
      await postAPI.deletePost(postToDelete);
      await fetchPosts();
      setOpenDeleteDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setDescription(post.description);
    // Note: You can't edit existing images in this implementation
    // You would need to handle that differently in your API
  };

  const charsRemaining = MAX_CHARS - description.length;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      p: { xs: 2, md: 4 }
    }}>
      <Grid container justifyContent="center" spacing={3}>
        <Grid item xs={12} md={8} lg={6}>
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                {editingPost ? 'Edit Post' : 'Create Post'}
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="What's on your mind?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  inputProps={{ maxLength: MAX_CHARS }}
                  sx={{ mb: 2 }}
                />
                
                <Typography 
                  variant="caption" 
                  color={charsRemaining < 50 ? 'error' : 'text.secondary'}
                  sx={{ display: 'block', textAlign: 'right' }}
                >
                  {charsRemaining} characters remaining
                </Typography>
                
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddPhotoAlternate />}
                    onClick={() => fileInputRef.current.click()}
                    sx={{ flexShrink: 0 }}
                  >
                    Add Images
                  </Button>
                  
                  {files.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {files.length} image(s) selected
                    </Typography>
                  )}
                </Box>
                
                {previews.length > 0 && (
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                    gap: 2,
                    mb: 3
                  }}>
                    {previews.map((preview, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          image={preview}
                          alt={`Preview ${index}`}
                          sx={{ 
                            borderRadius: 2,
                            height: 120,
                            objectFit: 'cover'
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(0,0,0,0.7)'
                            }
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                  disabled={loading || !description.trim()}
                  sx={{ mt: 2 }}
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
              </Box>
              
              {error && (
                <Box sx={{ mt: 2 }}>
                  <ErrorMessage message={error} />
                </Box>
              )}
            </CardContent>
          </Card>
          
          <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Your Posts
          </Typography>
          
          {loading && posts.length === 0 ? (
            <LoadingSpinner />
          ) : posts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                You haven't created any posts yet
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {posts.map((post, idx) => (
                <Card key={post.id} sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar src={post.user?.avatar} alt={post.user?.name} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {post.user?.name || 'You'}
                        </Typography>
                        {post.user?.title && (
                          <Typography variant="caption" color="text.secondary">
                            {post.user.title}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Typography variant="body1" paragraph>
                      {post.description}
                    </Typography>
                    {/* Hybrid image display: show previews for the most recent post, backend images for others */}
                    {idx === 0 && previews.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        {previews.map((preview, i) => (
                          <img
                            key={i}
                            src={preview}
                            alt={`Preview ${i}`}
                            style={{ width: 200, borderRadius: 8 }}
                          />
                        ))}
                      </Box>
                    ) : (
                      post.imageUrls?.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          {post.imageUrls.map((url, i) => (
                            <img
                              key={i}
                              src={url.startsWith('http') ? url : `${API_URL}${url}`}
                              alt={`Post image ${i}`}
                              style={{ width: 200, borderRadius: 8 }}
                              onError={e => { e.target.src = '/fallback.png'; }}
                            />
                          ))}
                        </Box>
                      )
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                      Posted on {new Date(post.createdAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Warning color="warning" fontSize="large" />
            <Typography>
              Are you sure you want to delete this post? This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeletePost}
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreatePost;