import { useEffect, useState } from 'react';
import { feedAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDistanceToNow } from 'date-fns';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Grid,
  useTheme,
  Avatar,
  Divider
} from '@mui/material';
import { Add, Edit, Delete, Refresh, MoreVert } from '@mui/icons-material';

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingFeed, setEditingFeed] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const theme = useTheme();

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const res = await feedAPI.getAllFeeds();
      setFeeds(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching feeds:', err);
      setError('Failed to load feeds. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingFeed) {
        const res = await feedAPI.updateFeed(editingFeed.id, formData);
        setFeeds(prev => prev.map(feed => 
          feed.id === editingFeed.id ? res.data : feed
        ));
      } else {
        const res = await feedAPI.createFeed(formData);
        setFeeds(prev => [...prev, res.data]);
      }
      handleCloseForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save feed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feed?')) return;
    
    try {
      setLoading(true);
      await feedAPI.deleteFeed(id);
      setFeeds(prev => prev.filter(feed => feed.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete feed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feed) => {
    setEditingFeed(feed);
    setFormData({
      title: feed.title,
      content: feed.content
    });
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingFeed(null);
    setFormData({
      title: '',
      content: ''
    });
  };

  if (loading && !feeds.length) return <LoadingSpinner fullScreen />;
  if (error && !feeds.length) return <ErrorMessage message={error} fullScreen />;

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 },
      width: '100%',
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      <Box sx={{ 
        maxWidth: '1200px',
        mx: 'auto',
        width: '100%'
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Feed
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<Refresh />}
              onClick={fetchFeeds}
              variant="outlined"
              sx={{ 
                px: 3,
                borderRadius: '8px'
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenForm(true)}
              sx={{ 
                px: 3,
                borderRadius: '8px',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none'
                }
              }}
            >
              New Post
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {feeds.map((feed, index) => (
            <Grid item xs={12} key={feed.id}>
              {index > 0 && <Divider sx={{ my: 2 }} />}
              <Card sx={{ 
                borderRadius: '12px',
                boxShadow: theme.shadows[1],
                '&:hover': {
                  boxShadow: theme.shadows[3]
                }
              }}>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2
                  }}>
                    <Avatar sx={{ 
                      bgcolor: theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      mr: 2
                    }}>
                      {feed.author?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {feed.author || 'Anonymous'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(feed.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feed.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {feed.content}
                  </Typography>
                </CardContent>
                <CardActions sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  px: 2,
                  pb: 2
                }}>
                  <IconButton 
                    onClick={() => handleEdit(feed)} 
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(feed.id)} 
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {feeds.length === 0 && !loading && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '60vh',
            textAlign: 'center'
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No posts yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Be the first to share something with the community!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenForm(true)}
              sx={{ mt: 2 }}
            >
              Create Post
            </Button>
          </Box>
        )}
      </Box>

      <Dialog 
        open={openForm} 
        onClose={handleCloseForm} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingFeed ? 'Edit Post' : 'Create New Post'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              margin="normal"
              required
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handleCloseForm}
              sx={{
                px: 3,
                borderRadius: '8px'
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{
                px: 3,
                borderRadius: '8px',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none'
                }
              }}
            >
              {editingFeed ? 'Update' : 'Post'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Feed;