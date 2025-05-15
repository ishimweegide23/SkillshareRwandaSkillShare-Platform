import { useEffect, useState } from 'react';
import { learningProgressAPI } from '../services/api';
import { format } from 'date-fns';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Tooltip,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  CheckCircle,
  AccessTime,
  Edit,
  Delete,
  Cancel,
  Save,
  FilterList,
  Sort,
  Refresh,
  CalendarToday,
  Schedule
} from '@mui/icons-material';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const statusOptions = [
  { value: 'not-started', label: 'Not Started', color: 'default' },
  { value: 'in-progress', label: 'In Progress', color: 'primary' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'on-hold', label: 'On Hold', color: 'warning' }
];

const LearningProgress = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('date-desc');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'in-progress',
    date: format(new Date(), 'yyyy-MM-dd'),
    duration: 30
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await learningProgressAPI.getProgress();
      console.log('API Response:', res);
      // Ensure we're setting an array
      setProgress(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load learning progress. Please try again.');
      setProgress([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.date) errors.date = 'Date is required';
    if (formData.duration <= 0) errors.duration = 'Duration must be positive';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const res = await learningProgressAPI.createProgress(formData);
      setProgress(prev => [...prev, res.data]);
      handleCloseForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create learning item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      const res = await learningProgressAPI.updateProgress(editingItem.id, formData);
      setProgress(prev => prev.map(item => 
        item.id === editingItem.id ? res.data : item
      ));
      handleCloseForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update learning item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await learningProgressAPI.deleteProgress(itemToDelete);
      setProgress(prev => prev.filter(item => item.id !== itemToDelete));
      setOpenDeleteDialog(false);
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
    setOpenForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  const handleOpenDeleteDialog = (id) => {
    setItemToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      status: 'in-progress',
      date: format(new Date(), 'yyyy-MM-dd'),
      duration: 30
    });
    setFormErrors({});
  };

  const filteredProgress = progress.filter(item => {
    if (activeFilter === 'all') return true;
    return item.status === activeFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'duration-asc':
        return (a.duration || 0) - (b.duration || 0);
      case 'duration-desc':
        return (b.duration || 0) - (a.duration || 0);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'default';
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  };

  if (loading && !progress.length) return <LoadingSpinner fullScreen />;
  if (error && !progress.length) return <ErrorMessage message={error} fullScreen />;

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      p: { xs: 2, md: 4 }
    }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={10} lg={8}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Learning Progress
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
                startAdornment={<Sort fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="date-desc">Newest First</MenuItem>
                <MenuItem value="date-asc">Oldest First</MenuItem>
                <MenuItem value="duration-desc">Longest First</MenuItem>
                <MenuItem value="duration-asc">Shortest First</MenuItem>
              </Select>
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenForm(true)}
                sx={{ ml: 'auto' }}
              >
                Add New
              </Button>
            </Box>
          </Box>

          <Tabs
            value={activeFilter}
            onChange={(e, newValue) => setActiveFilter(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            <Tab label="All" value="all" />
            {statusOptions.map((status) => (
              <Tab 
                key={status.value}
                label={status.label}
                value={status.value}
                icon={
                  <Badge 
                    badgeContent={
                      progress.filter(p => p.status === status.value).length
                    } 
                    color={status.color}
                    max={99}
                  />
                }
                iconPosition="end"
              />
            ))}
          </Tabs>

          {filteredProgress.length === 0 ? (
            <Paper sx={{ 
              p: 4, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <Typography variant="h6" color="textSecondary">
                {activeFilter === 'all' 
                  ? 'No learning items yet'
                  : `No ${getStatusLabel(activeFilter).toLowerCase()} items`}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {activeFilter === 'all'
                  ? 'Start tracking your learning progress by adding your first item'
                  : `You don't have any ${getStatusLabel(activeFilter).toLowerCase()} learning items`}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenForm(true)}
                sx={{ mt: 2 }}
              >
                Add Learning Item
              </Button>
            </Paper>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {filteredProgress.map((item) => (
                <Card 
                  key={item.id} 
                  sx={{ 
                    mb: 2,
                    borderLeft: `4px solid`,
                    borderColor: `${getStatusColor(item.status)}.main`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 2
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="div">
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {item.description}
                        </Typography>
                      </Box>
                      
                      <Chip
                        label={getStatusLabel(item.status)}
                        color={getStatusColor(item.status)}
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 2,
                      gap: 2
                    }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday fontSize="small" sx={{ mr: 0.5 }} />
                          {format(new Date(item.date), 'MMM d, yyyy')}
                        </Typography>
                        
                        {item.duration && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Schedule fontSize="small" sx={{ mr: 0.5 }} />
                            {item.duration} mins
                          </Typography>
                        )}
                      </Box>
                      
                      <Box>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(item)}
                            color="primary"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDeleteDialog(item.id)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </Grid>
      </Grid>

      {/* Add/Edit Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={handleCloseForm}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingItem ? 'Edit Learning Item' : 'Add New Learning Item'}
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.date}
                  helperText={formErrors.date}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }}
                  error={!!formErrors.duration}
                  helperText={formErrors.duration}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Select
                  fullWidth
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseForm}
            startIcon={<Cancel />}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            variant="contained"
            disabled={loading}
          >
            {editingItem ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this learning item? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
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

export default LearningProgress;